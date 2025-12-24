'use client'

import Head from 'next/head'

const PageMeta = ({ title, description }) => {
  return (
    <Head>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
    </Head>
  )
}

export default PageMeta