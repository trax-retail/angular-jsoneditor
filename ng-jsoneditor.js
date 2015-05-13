(function () {
    var module = angular.module('ng.jsoneditor', []);
    module.constant('ngJsoneditorConfig', {});

    module.directive('ngJsoneditor', ['ngJsoneditorConfig', '$timeout', function (ngJsoneditorConfig, $timeout) {
        var defaults = ngJsoneditorConfig || {};

        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {'options': '=', 'ngJsoneditor': '='},
            link: function ($scope, element, attrs, ngModel) {
                var editor;

                if (!angular.isDefined(window.JSONEditor)) {
                    throw new Error("Please add the jsoneditor.js script first!");
                }

                function _createEditor(options) {
                    var settings = angular.extend({}, defaults, options);
                    var theOptions = angular.extend({}, settings, {
                        change: function () {
                            $timeout(function () {
                                if (editor) {
                                    ngModel.$setViewValue(editor.get());

                                    if (settings && settings.hasOwnProperty('change')) {
                                        settings.change();
                                    }
                                }
                            });
                        }
                    });

                    element.html('');

                    var instance = new JSONEditor(element[0], theOptions);

                    if ($scope.ngJsoneditor instanceof Function) {
                        $timeout(function () {
                            $scope.ngJsoneditor(instance);
                        });
                    }

                    return instance;
                }

                $scope.$watch('options', function (newValue, oldValue) {
                    for (var k in newValue) {
                        if (newValue.hasOwnProperty(k)) {
                            var v = newValue[k];

                            if (newValue[k] !== oldValue[k]) {
                                if (k === 'mode') {
                                    editor.setMode(v);
                                } else if (k === 'name') {
                                    editor.setName(v);
                                } else { //other settings cannot be changed without re-creating the JsonEditor
                                    editor = _createEditor(newValue);
                                    ngModel.$render();
                                    return;
                                }
                            }
                        }
                    }
                });

                $scope.$on('$destroy', function () {
                    //remove jsoneditor?
                });

                ngModel.$render = function () {
                    editor.set(ngModel.$viewValue);
                };

                editor = _createEditor($scope.options);
            }
        };
    }]);
})();
