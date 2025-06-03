// vite.config.js
export default {
	base: '/conduit/',
	root: '.',               // Project root
	publicDir: 'public',     // Static files
	build: {
    outDir: 'dist',        // Output folder for deployment
    emptyOutDir: true
  }
};
