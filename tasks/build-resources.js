import gulp from "gulp";

import paths from "../paths.json";

gulp.task("build-resources", () => {
	return gulp.src(paths.source.resources)
		.pipe(gulp.dest(paths.build.directories.resources));
});
