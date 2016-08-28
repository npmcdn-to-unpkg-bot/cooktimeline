angular.module('cookTimeline')
    .directive('countdownTimer', function () {

        function link(scope, element, attrs) {
            scope.$watch(attrs['myCurrentTime'], function (value) {
                updateTime(value);
            });

            var updateTime = function (value) {
                var now = new moment();
                var future = new moment(value);
                var diff = future.toDate() / 1000 - now.toDate() / 1000;

                if (clock) {
                    clock = $(element).FlipClock(diff);
                    clock.setCountdown(true);
                }
            };

            var clock = $(element).FlipClock(3600);
        }

        return {
            link: link
        };
    });