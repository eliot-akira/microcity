const config = {
  build: [
    {
      src: 'src/index.js',
      dest: 'docs/index.min.js'
    },
    {
      src: 'src/index.scss',
      dest: 'docs/index.min.css'
    },
    {
      src: 'src/**/index.html',
      dest: 'docs',
    },
    {
      task: 'copy',
      src: 'public',
      dest: 'docs',
    },
  ],
  format: 'src',
  serve: {
    dir: 'docs',
    port: 3001
  }
}

module.exports = config