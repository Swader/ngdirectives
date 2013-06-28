/**
 *
 * This is an angular flavored jQuery UI slider inspired by the answers here:
 * http://stackoverflow.com/questions/17264390/changes-in-jquery-ui-not-reflected-on-angular-models
 *
 * I've edited it to remove dependeny on ccnut and logger, and to support ranges. I also removed the use
 * of ng-model because it was impossible (to my knowledge at least) to attach two models to a component.
 *
 * This directive also supports a tooltip function, which can be defined in the parent scope, and is called
 * automatically on slide. It is defined as an additional attribute "tooltipfn". A tooltip function could look
 * like this;
 *

 scope.tooltipFunction = function(slider) {
            val1 = '<div class="slider_tooltip">' + slider.slider("values", 0) + '</div>';
            val2 = '<div class="slider_tooltip">' + slider.slider("values", 1) + '</div>';
            slider.children('.ui-slider-handle').first().html(val1);
            slider.children('.ui-slider-handle').last().html(val2);
        }

 You would then define it in the element as such:
 <div
    value="['rangeSlider1', 'rangeSlider2']"
    tooltipfn="tooltipFunction"
    jquislider="{min:1, max:5, range: true, values: [2,4]}"
 ></div>

 *
 *
 * See the appropriate demo page for demos.
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
            // Get models to which to bind value(s) as they change
            var valueModels = scope.$eval(iAttrs.value);

            // Models need to be defined
            if (valueModels == undefined || valueModels == null || valueModels.length < 1) {
                console.log('jQuery UI slider directive failed to load. Missing value attribute on element.');
                return false;
            }

            // A min and max needs to be set
            if (options.min == undefined || options.max == undefined) {
                console.log('jQuery UI slider directive failed to load. Missing min and max attributes on element.')
            }

            // Check if we're dealing with a range slider, or a regular slider
            var isRange = (options.range != undefined && options.range);

            // Initialize default values if they haven't been set and set the models to those values
            if (isRange) {
                if (options.values == undefined) {
                    options.values = [options.min + 1, options.max + 1];
                }
                scope[valueModels[0]] = options.values[0];
                scope[valueModels[1]] = options.values[1];
            } else {
                var defaultValue = [Math.floor((options.min + options.max) / 2)];
                if (options.value == undefined && options.values == undefined) {
                    options.values = [defaultValue];
                    options.value = defaultValue;
                } else if (options.value == undefined) {
                    options.value = options.values[0];
                } else if (options.values == undefined) {
                    options.values = [options.value];
                }
                scope[valueModels] = options.value;
            }

            /**
             * This function changes models as the slider gets created or slides, and calls a tooltip
             * method on the parent controller's scope, if one exists.
             * @param slider
             */
            var applyChangesToView = function (slider) {

                var values = slider.slider("values");

                if (isRange) {
                    scope[valueModels[0]] = values[0];
                    scope[valueModels[1]] = values[1];
                } else {
                    scope[valueModels] = values[0];
                }

                if (iAttrs.tooltipfn != undefined) {
                    scope.$parent[iAttrs.tooltipfn](slider);
                }
            }

            /**
             * Create handler, called when slider is created
             * @param event
             * @param ui
             */
            options.create = function (event, ui) {
                applyChangesToView($(this));
            }

            /**
             * Slide handler, called when slider handles move
             * @param event
             * @param ui
             */
            options.slide = function (event, ui) {
                applyChangesToView($(this));
                scope.$apply();
            }

            // Init slider
            iElement.slider(options);

            // Update slider when view needs to be updated by $watching the models
            if (isRange) {
                scope.$watch(valueModels[0], function (v) {
                    iElement.slider('values', [v, iElement.slider('values')[1]]);
                    if (iAttrs.tooltipfn != undefined) {
                        scope.$parent[iAttrs.tooltipfn](iElement);
                    }
                });
                scope.$watch(valueModels[1], function (v) {
                    iElement.slider('values', [iElement.slider('values')[0], v]);
                    if (iAttrs.tooltipfn != undefined) {
                        scope.$parent[iAttrs.tooltipfn](iElement);
                    }
                });
            } else {
                scope.$watch(valueModels, function (v) {
                    iElement.slider('value', v);
                    if (iAttrs.tooltipfn != undefined) {
                        scope.$parent[iAttrs.tooltipfn](iElement);
                    }
                });
            }
        }
    }
};