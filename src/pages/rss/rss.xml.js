import genHtml from './_htmlGenerator.js'

const { SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_PROJECT_DATASET } = import.meta.env

const CONFIG_QUERY = encodeURIComponent('*[_type == "config"]{...,character->{"avatar": image.asset->url, ...}}');
const CONFIG_URL = `https://${SANITY_STUDIO_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_STUDIO_PROJECT_DATASET}?query=${CONFIG_QUERY}`;

const POSTS_QUERY = encodeURIComponent('*[_type == "cheep"||_type == "article"]{...,article[]->{tags[]->{...}}, author->{"avatar": image.asset->url, ...}, tags[]->{...}} | order(publishedAt desc)')
const POSTS_URL = `https://${SANITY_STUDIO_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_STUDIO_PROJECT_DATASET}?query=${POSTS_QUERY}`;

// Grab the posts && config
const posts = await (await (await fetch(POSTS_URL)).json()).result
const siteConfig = await (await (await fetch(CONFIG_URL)).json()).result[0]

const metadata = {
  url: siteConfig?.rss?.url || 'https://jhey.dev/',
  title: siteConfig?.rss?.title || 'https://jhey.dev/',
  subtitle: siteConfig?.rss?.subtitle || 'jheys cool posts',
  description: siteConfig?.rss?.description || 'The RSS feed for posts from Jhey Tompkins',
  author: siteConfig.character,
  email: 'rss@jhey.dev',
}

export const get = () => new Promise((resolve, reject) => {
  resolve({ body: `<?xml version="1.0" encoding="utf-8"?>
    <rss version="2.0"
      xmlns:content="http://purl.org/rss/1.0/modules/content/"
      xmlns:wfw="http://wellformedweb.org/CommentAPI/"
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:atom="http://www.w3.org/2005/Atom"
      xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
      xmlns:slash="http://purl.org/rss/1.0/modules/slash/"
      xmlns:georss="http://www.georss.org/georss"
      xmlns:geo="http://www.w3.org/2003/01/geo/wgs84_pos#"
    >
      <channel>
        <title>${metadata.title}</title>
        <link>${metadata.url}</link>
        <atom:link href="${metadata.url}rss/rss.xml" rel="self" type="application/rss+xml" />
        <description>${metadata.description}</description>
        <language>en-us</language>
        <copyright>Jhey Tompkins ${new Date().getFullYear()}</copyright>
        <docs>https://www.rssboard.org/rss-specification</docs>
        <pubDate>${new Date().toUTCString()}</pubDate>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <managingEditor>${metadata.email} (${metadata.author.name})</managingEditor>
        <webMaster>${metadata.email} (${metadata.author.name})</webMaster>
        <image>
          <url>${metadata.author.avatar}</url>
          <title>${metadata.title}</title>
          <link>${metadata.url}</link>
        </image>
        ${posts.map(post => {
          let tags = [...post.tags.filter(t => t !== null)]
          if (post._type === 'cheep' && post.article) {
            for (const article of post.article) {
              if (article.tags) {
                for (const tag of article.tags) {
                  if(!tags.find(t => t._id === tag._id)) tags.push(tag)
                }
              }
            }
          }
          return (`
            <item>
              <title>${post.title}</title>
              <link>${metadata.url}post/${post.slug.current}</link>
              <author>${metadata.email} (${post.author.name})</author>
              <description><![CDATA[${genHtml(post.body || post.cheep)}]]></description>
              <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
              <guid isPermaLink="true">${metadata.url}post/${post.slug.current}</guid>
              <source url="${metadata.url}rss/rss.xml">jhey.dev RSS feed</source>
              ${tags.map(tag => (`
                <category>${tag.title}</category>
              `)).join('')}
            </item>
          `)
        }).join('')}
      </channel>
    </rss>
  ` })
})