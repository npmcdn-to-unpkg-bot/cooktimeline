/*jslint node: true */
'use strict';

var pkg = require('./package.json');

//Using exclusion patterns slows down Grunt significantly
//instead of creating a set of patterns like '**/*.js' and '!**/node_modules/**'
//this method is used to create a set of inclusive patterns for all subdirectories
//skipping node_modules, bower_components, dist, and any .dirs
//This enables users to create any directory structure they desire.
var createFolderGlobs = function (fileTypePatterns) {
    fileTypePatterns = Array.isArray(fileTypePatterns) ? fileTypePatterns : [fileTypePatterns];
    var ignore = ['node_modules', 'bower_components', 'dist', 'temp', 'support', 'assets'];
    var fs = require('fs');
    return fs.readdirSync(process.cwd())
        .map(function (file) {
            if (ignore.indexOf(file) !== -1 ||
                file.indexOf('.') === 0 || !fs.lstatSync(file).isDirectory()) {
                return null;
            } else {
                return fileTypePatterns.map(function (pattern) {
                    return file + '/**/' + pattern;
                });
            }
        })
        .filter(function (patterns) {
            return patterns;
        })
        .concat(fileTypePatterns);
};

module.exports = function (grunt) {

    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        timestamp: new Date().getTime(),
        connect: {
            main: {
                options: {
                    port: 8000,
                    middleware: function (connect, options) {
                        // Same as in grunt-contrib-connect
                        var middlewares = [];
                        var directory = options.directory ||
                            options.base[options.base.length - 1];
                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }
                        // Here comes the PHP middleware
                        // middlewares.push(mockServer);
                        // Same as in grunt-contrib-connect
                        options.base.forEach(function (base) {
                            middlewares.push(connect.static(base));
                        });
                        middlewares.push(connect.directory(directory));
                        return middlewares;
                    }
                }
            }
        },
        watch: {
            main: {
                options: {
                    livereload: true,
                    livereloadOnError: false,
                    spawn: false
                },
                files: [createFolderGlobs(['*.js', '*.less', '*.html']), '!_SpecRunner.html', '!.grunt'],
                tasks: [] //all the tasks are run dynamically during the watch event handler
            }
        },
        jshint: {
            main: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: [createFolderGlobs('*.js'), '!mockServer.js', '!web-server.js']
            }
        },
        clean: {
            before: {
                src: ['dist', 'temp']
            },
            after: {
                src: ['temp']
            }
        },
        less: {
            production: {
                options: {
                },
                files: {
                    'temp/app.css': 'app.less'
                }
            }
        },
        ngtemplates: {
            main: {
                options: {
                    module: pkg.name,
                    htmlmin: '<%= htmlmin.main.options %>'
                },
                src: [createFolderGlobs('*.html'), '!index.html', '!_SpecRunner.html'],
                dest: 'temp/templates.js'
            }
        },
        copy: {
            main: {
                files: [
                    { src: ['images/**'], dest: 'dist/' },
                    {src: ['fonts/**'], dest: 'dist/'},
                    { src: ['bower_components/boostrap/dist/fonts/**'], dest: 'dist/' },
                    { src: ['audio/**'], dest: 'dist/' },
                    { src: ['data/**'], dest: 'dist/' }
                ]
            }
        },
        dom_munger: {
            read: {
                options: {
                    read: [
                        { selector: 'script[data-concat!="false"]', attribute: 'src', writeto: 'appjs' },
                        { selector: 'link[rel="stylesheet"][data-concat!="false"]', attribute: 'href', writeto: 'appcss' }
                    ]
                },
                src: 'index.html'
            },
            update: {
                options: {
                    remove: ['script[data-remove!="false"]', 'link[data-remove!="false"]'],
                    append: [
                        { selector: 'body', html: '<script src="./app.full.min.<%= timestamp %>.js"></script>' },
                        { selector: 'head', html: '<link rel="stylesheet" href="./app.full.min.<%= timestamp %>.css">' }
                    ]
                },
                src: 'index.html',
                dest: 'dist/index.html'
            },
            updateDebug: {
                options: {
                    remove: ['script[data-remove!="false"]', 'link[data-remove!="false"]'],
                    append: [
                      { selector: 'body', html: '<script src="./app.full.min.js"></script>' },
                      { selector: 'head', html: '<link rel="stylesheet" href="./app.full.min.<%= timestamp %>.css">' }
                    ]
                },
                src: 'index.html',
                dest: 'dist/index.html'
            }
        },
        cssmin: {
            main: {
                src: ['temp/app.css', '<%= dom_munger.data.appcss %>'],
                dest: 'dist/app.full.min.<%= timestamp %>.css'
            }
        },
        concat: {
            main: {
                src: ['<%= dom_munger.data.appjs %>', '<%= ngtemplates.main.dest %>'],
                dest: 'temp/app.full.js'
            }
        },
        ngAnnotate: {
            main: {
                src: 'temp/app.full.js',
                dest: 'temp/app.full.js'
            }
        },
        uglify: {
            release: {
                options: {
                    banner: '/*! otaku smoke and brew <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                    mangle: true,
                    compress: false,
                    sourceMap: 'dist/app.full.min.<%= timestamp %>.js.map'
                },
                src: 'temp/app.full.js',
                dest: 'dist/app.full.min.<%= timestamp %>.js'
            },
            debug: {
                options: {
                    banner: '/*! otaku smoke and brew <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                    mangle: false,
                    compress: false,
                    sourceMap: 'dist/app.full.min.js.map',
                    beautify: {
                        width: 80,
                        beautify: true
                    },
                },
                src: 'temp/app.full.js',
                dest: 'dist/app.full.min.js'
            }
        },
        htmlmin: {
            main: {
                options: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true
                },
                files: {
                    'dist/index.html': 'dist/index.html'
                }
            }
        },
        imagemin: {
            main: {
                files: [
                  {
                      expand: true, cwd: 'dist/',
                      src: ['**/{*.png,*.jpg}'],
                      dest: 'dist/'
                  }
                ]
            }
        },
        karma: {
            options: {
                frameworks: ['jasmine'],
                files: [  //this files data is also updated in the watch handler, if updated change there too
                    '<%= dom_munger.data.appjs %>',
                    'bower_components/angular-mocks/angular-mocks.js',
                    createFolderGlobs('*-spec.js')
                ],
                logLevel: 'ERROR',
                reporters: ['mocha'],
                autoWatch: false, //watching is handled by grunt-contrib-watch
                singleRun: true
            },
            all_tests: {
                browsers: ['PhantomJS', 'Chrome', 'Firefox']
            },
            during_watch: {
                browsers: ['PhantomJS']
            }
        }
    });

    grunt.event.on('watch', function (action, filepath) {
        //https://github.com/gruntjs/grunt-contrib-watch/issues/156

        var tasksToRun = [];

        if (filepath.lastIndexOf('.js') !== -1 && filepath.lastIndexOf('.js') === filepath.length - 3) {

            //lint the changed js file
            grunt.config('jshint.main.src', filepath);
            tasksToRun.push('jshint');

            //find the appropriate unit test for the changed file
            var spec = filepath;
            if (filepath.lastIndexOf('-spec.js') === -1 || filepath.lastIndexOf('-spec.js') !== filepath.length - 8) {
                spec = filepath.substring(0, filepath.length - 3) + '-spec.js';
            }

            //if the spec exists then lets run it
            if (grunt.file.exists(spec)) {
                var files = [].concat(grunt.config('dom_munger.data.appjs'));
                files.push('bower_components/angular-mocks/angular-mocks.js');
                files.push(spec);
                grunt.config('karma.options.files', files);
                tasksToRun.push('karma:during_watch');
            }
        }

        //if index.html changed, we need to reread the <script> tags so our next run of karma
        //will have the correct environment
        if (filepath === 'index.html') {
            tasksToRun.push('dom_munger:read');
        }

        grunt.config('watch.main.tasks', tasksToRun);

    });

    grunt.registerTask('default', ['dom_munger:read', 'jshint', 'connect', 'watch']);
    grunt.registerTask('Release', ['jshint', 'clean:before', 'less', 'dom_munger:read', 'dom_munger:update', 'ngtemplates', 'cssmin', 'concat', 'ngAnnotate:main', 'uglify:release', 'copy', 'htmlmin', 'imagemin', 'clean:after']);
    grunt.registerTask('Preview-Dashboard', ['jshint', 'clean:before', 'less', 'dom_munger:read', 'dom_munger:update', 'ngtemplates', 'cssmin', 'concat', 'ngAnnotate:main', 'uglify:release', 'copy', 'htmlmin', 'imagemin', 'clean:after']);
    grunt.registerTask('Preview-OLO', ['jshint', 'clean:before', 'less', 'dom_munger:read', 'dom_munger:update', 'ngtemplates', 'cssmin', 'concat', 'ngAnnotate:main', 'uglify:release', 'copy', 'htmlmin', 'imagemin', 'clean:after']);
    grunt.registerTask('Preview-Signup', ['jshint', 'clean:before', 'less', 'dom_munger:read', 'dom_munger:update', 'ngtemplates', 'cssmin', 'concat', 'ngAnnotate:main', 'uglify:release', 'copy', 'htmlmin', 'imagemin', 'clean:after']);
    grunt.registerTask('Debug', ['jshint', 'clean:before', 'less', 'dom_munger:read', 'dom_munger:updateDebug', 'ngtemplates', 'cssmin', 'concat', 'ngAnnotate:main', 'uglify:debug', 'copy', 'htmlmin', 'imagemin', 'clean:after']);
    grunt.registerTask('serve', ['dom_munger:read', 'jshint', 'connect', 'watch']);
    grunt.registerTask('test', ['dom_munger:read', 'karma:all_tests']);
};
