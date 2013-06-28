/**
 *
 * This is an angular flavored jQuery UI slider inspired by the answers here:
 * http://stackoverflow.com/questions/17264390/changes-in-jquery-ui-not-reflected-on-angular-models
 *
 * I've edited it to remove dependeny on ccnut and logger, and to support ranges. I also removed the use
 * of ng-model because it was impossible (to my knowledge at least) to attach two models to a component.
 *
 * Usage example:
 *

 <div value="['rangeSlider1', 'rangeSlider2']" jquislider="{min:1, max:5, range: true, values: [2,4]}"></div>
 <div value="'nonRangeSlider'" jquislider="{min:1, max:5}"></div>
 <input type="number" ng-model="rangeSlider1" /><br/>
 <input type="number" ng-model="rangeSlider2" /><br/>
 <input type="number" ng-model="nonRangeSlider" /><br/>

 Make sure you declare this directive in your app, like so:

 myApp.directives('jquislider', jquisliderFn);

 *
 * @returns {{restrict: string, link: Function}}
 */

var jquisliderFn = function () {
    return {
        restrict: 'AC',
        link: function (scope, iElement, iAttrs) {

            // Get options
            var options = angular.extend({}, scope.$eval(iAttrs.jquislider));
            var valueModels = scope.$eval(iAttrs.value);

            if (valueModels == undefined || valueModels == null || valueModels.length < 1) {
                console.log('jQuery UI slider directive failed to load. Missing value attribute on element.');
                return false;
            }

            if (options.min == undefined || options.max == undefined) {
                console.log('jQuery UI slider directive failed to load. Missing min and max attributes on element.')
                return false;
            }

            var isRange = (options.range != undefined && options.range);

            if (isRange) {
                if (options.values == undefined) {
                    options.values = [options.min +1, options.max+1];
                }
                scope[valueModels[0]] = options.values[0];
                scope[valueModels[1]] = options.values[1];
            } else {
                if (options.values == undefined) {
                    options.values = Math.floor((options.min + options.max) / 2);
                }
                scope[valueModels] = options.values;
            }

            iElement.slider(options);

            // Update model on slide event
            iElement.on('slide', function (event, ui) {
                if (isRange) {
                    scope[valueModels[0]] = ui.values[0];
                    scope[valueModels[1]] = ui.values[1];
                } else {
                    scope[valueModels] = ui.value;
                }
                scope.$apply();
            });

            // Update slider when view needs to be updated
            if (isRange) {
                scope.$watch(valueModels[0], function(v) {
                    iElement.slider('values', [v, iElement.slider('values')[1]]);
                });
                scope.$watch(valueModels[1], function(v) {
                    iElement.slider('values', [iElement.slider('values')[0], v]);
                });
            } else {
                scope.$watch(valueModels, function(v) {
                    iElement.slider('value', v);
                });
            }

            return true;
        }
    };
}