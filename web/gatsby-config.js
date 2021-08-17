require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

module.exports = {
    siteMetadata: {
      siteUrl: `https://tivy.app`,
    },
    plugins: [
      'gatsby-plugin-postcss',
      `gatsby-plugin-sitemap`,
      `gatsby-plugin-react-helmet`,
      {
        resolve: `gatsby-plugin-google-gtag`,
        options: {
          // You can add multiple tracking ids and a pageview event will be fired for all of them.
          trackingIds: [
            "UA-60419825-1" // Google Analytics / GA
          ],
        },
      },
    ]
}