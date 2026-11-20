import { sql } from "../_lib/db.js";
import { requireSession } from "../_lib/auth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  res.setHeader("Cache-Control", "private, no-store");
  const session = requireSession(req, res);
  if (!session) return;

  const isAdmin = session.role === "admin";

  try {
    const [summaryRows, monthRows, topPostRows, journalistRows] = await Promise.all([
      sql`
        select count(*)::int as publications,
          coalesce(sum(visualizacoes), 0)::bigint as views,
          count(*) filter (where criado_em >= date_trunc('month', now()))::int as month_publications,
          coalesce(round(avg(visualizacoes)), 0)::int as average_views
        from posts
        where (${isAdmin} or lower(author_login) = lower(${session.email}))
      `,
      sql`
        select to_char(months.month_start, 'YYYY-MM') as month,
          count(posts.id)::int as publications
        from generate_series(
          date_trunc('month', now()) - interval '5 months',
          date_trunc('month', now()),
          interval '1 month'
        ) as months(month_start)
        left join posts on posts.criado_em >= months.month_start
          and posts.criado_em < months.month_start + interval '1 month'
          and (${isAdmin} or lower(posts.author_login) = lower(${session.email}))
        group by months.month_start
        order by months.month_start
      `,
      sql`
        select id, titulo, visualizacoes
        from posts
        where (${isAdmin} or lower(author_login) = lower(${session.email}))
        order by visualizacoes desc, criado_em desc
        limit 5
      `,
      isAdmin
        ? sql`
            select coalesce(nullif(profiles.display_name, ''), users.login) as name,
              count(posts.id)::int as publications,
              coalesce(sum(posts.visualizacoes), 0)::bigint as views
            from admin_users as users
            left join admin_profiles as profiles on lower(profiles.login) = lower(users.login)
            left join posts on lower(posts.author_login) = lower(users.login)
            where users.role = 'journalist'
            group by users.login, profiles.display_name
            order by publications desc, views desc, name asc
          `
        : Promise.resolve([])
    ]);

    const summary = summaryRows[0];
    const ranking = journalistRows.map((journalist) => ({
      name: journalist.name,
      publications: Number(journalist.publications),
      views: Number(journalist.views)
    }));

    return res.status(200).json({
      metrics: {
        views: Number(summary.views),
        publications: Number(summary.publications),
        monthPublications: Number(summary.month_publications),
        averageViews: Number(summary.average_views),
        journalists: ranking.length
      },
      months: monthRows.map((month) => ({
        month: month.month,
        publications: Number(month.publications)
      })),
      topPosts: topPostRows.map((post) => ({
        id: Number(post.id),
        title: post.titulo,
        views: Number(post.visualizacoes)
      })),
      ranking
    });
  } catch (error) {
    console.error("Falha ao carregar o painel de métricas:", error);
    return res.status(500).json({ error: "Não foi possível carregar as métricas do painel." });
  }
}
