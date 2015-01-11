/**
 * Created by qinghui on 14/8/21.
 */
"use strict";

module.exports = function (grunt) {
    grunt.initConfig({
        copy: {
            all: {
                files: [
                    {
                        expand: true,
                        cwd: "css/",
                        src: ["*.css","**/*.css"],
                        dest: "build/css"
                    },
                    {
                        expand: true,
                        cwd: "js/",
                        src: ["base.js"],
                        dest: "build/js"
                    },
                    {
                        expand: true,
                        cwd: "img/",
                        src: ["*.png","*.jpg","*.gif"],
                        dest: "build/img"
                    },
                    {
                        expand: true,
                        cwd: "font/",
                        src: ["**"],
                        dest: "build/font"
                    },
                    {
                        expand: true,
                        src: ["*.html"],
                        dest: "build/"
                    }
                ]
            }
        },
        clean: {
            all: ["build/**","build/**/*.*"]
        },
        compass: {
            main: {
                options: {
                    sassDir: "sass/",
                    javascriptsDir: "js/",
                    specify: ["sass/*.scss", "sass/common/*.scss", "!sass/base/*.scss"],
                    imagesDir: "img/",
                    cssDir: "css/",
                    fontsDir: "fonts/",
                    noLineComments: true,
                    require: "ceaser-easing"
                }
            }
        },
        coffee: {
            main: {
                files: [{
                    expand: true,
                    cwd: "coffee/",
                    src: ["*.coffee"],
                    dest: "js/",
                    ext: ".js"
                }]
            }
        },
        concat: {
            dist: {
                src: ["js/*.js"],
                dest: 'js/base.js'
            }
        },
        watch: {
            coffee: {
                files: ["coffee/*.coffee"],
                tasks: ["coffee:main"]
            },
            css: {
                files: ["sass/*.scss", "sass/common/*.scss"],
                tasks: ["compass:main"]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('build', ["clean", "copy"]);
};
