app.directive('validpriceNumber', function () {
    return {
        require: '?ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            if (!ngModelCtrl) {
                return;
            }

            ngModelCtrl.$parsers.push(function (val) {
                if (angular.isUndefined(val)) {
                    var val = '';
                }

                var clean = val.replace(/[^-0-9\.]/g, '');
                var negativeCheck = clean.split('-');
                var decimalCheck = clean.split('.');
                if (!angular.isUndefined(negativeCheck[1])) {
                    negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
                    clean = negativeCheck[0] + '-' + negativeCheck[1];
                    if (negativeCheck[0].length > 0) {
                        clean = negativeCheck[0];
                    }

                }

                if (!angular.isUndefined(decimalCheck[1])) {
                    decimalCheck[1] = decimalCheck[1].slice(0, 2);
                    clean = decimalCheck[0] + '.' + decimalCheck[1];
                }

                if (val !== clean) {
                    ngModelCtrl.$setViewValue(clean);
                    ngModelCtrl.$render();
                }
                return clean;
            });

            element.bind('keypress', function (event) {
                if (event.keyCode === 32) {
                    event.preventDefault();
                }
            });
        }
    };

});
app.directive('onlyNumber', function ($timeout) {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});

app.directive('selectAll', function ($window) {
    return function (scope, element, attrs) {
        element.bind('click', function () {
            if (!$window.getSelection().toString()) {
                this.setSelectionRange(0, this.value.length)
            }
        });
        element.bind('focus', function () {
            if (!$window.getSelection().toString()) {
                this.setSelectionRange(0, this.value.length)
            }
        });
    };
});

app.directive("limitTo", [function () {
    return {
        restrict: "A",
        link: function (scope, elem, attrs) {
            var limit = parseInt(attrs.limitTo);
            angular.element(elem).on("keypress", function (e) {

                if (this.value.length == limit) e.preventDefault();
            });
        }
    }
}]);

//app.directive('typeahead', ['$compile', '$timeout', function ($compile, $timeout) {
//    return {
//        restrict: 'A',
//        transclude: true,
//        scope: {
//            ngModel: '=',
//            typeahead: '=',
//            typeaheadCallback: "="
//        },
//        link: function (scope, elem, attrs) {
//            var template = '<div class="dropdown"><ul class="dropdown-menu" style="display:block;" ng-hide="!ngModel.length || !filitered.length || selected"><li ng-repeat="item in filitered = (typeahead | filter:{items:ngModel} | limitTo:15) track by $index" ng-click="click(item)" style="cursor:pointer" ng-class="{active:$index==active}"  ng-mousedown="mousedown(item)" ng-mouseenter="mouseenter($index)"><a>{{item.items}}</a></li></ul></div>'

//            elem.bind('blur', function () {
//                $timeout(function () {
//                    scope.selected = true
//                }, 100)
//            })

//            elem.bind("keydown", function ($event) {
//                if ($event.keyCode == 38 && scope.active > 0) { // arrow up
//                    scope.active--
//                    scope.$digest()
//                } else if ($event.keyCode == 40 && scope.active < scope.filitered.length - 1) { // arrow down
//                    scope.active++
//                    scope.$digest()
//                } else if ($event.keyCode == 13) { // enter
//                    scope.$apply(function () {
//                        scope.click(scope.filitered[scope.active])
//                    })
//                }
//            })

//            scope.click = function (item) {
//                if (angular.isUndefined(item)) { } else {
//                    scope.ngModel = item.items
//                    scope.selected = item
//                    if (scope.typeaheadCallback) {
//                        scope.typeaheadCallback(item)
//                    }
//                    elem[0].blur()
//                }
//            }

//            scope.mouseenter = function ($index) {
//                scope.active = $index
//            }
//            scope.mousedown = function (item) {
//                if (angular.isUndefined(item)) { } else {
//                    scope.ngModel = item.items
//                    scope.selected = item
//                    if (scope.typeaheadCallback) {
//                        scope.typeaheadCallback(item)
//                    }
//                    elem[0].blur()
//                }
//            }
//            scope.$watch('ngModel', function (input) {
//                if (scope.selected && scope.selected.name == input) {
//                    return
//                }

//                scope.active = 0
//                scope.selected = false

//                // if we have an exact match and there is only one item in the list, automatically select it
//                if (angular.isUndefined(scope.filitered) || scope.filitered == "") { } else {
//                    if (input && scope.filitered.length == 1) { // && scope.filitered[0].name.toLowerCase() == input.toLowerCase()
//                        scope.click(scope.filitered[0])
//                    }
//                }
//            })

//            elem.after($compile(template)(scope))
//        }
//    }
//}]);
app.directive('typeahead', ['$compile', '$timeout', '$rootScope', function ($compile, $timeout, $rootScope) {
    return {
        restrict: 'A',
        transclude: true,
        scope: {
            ngModel: '=',
            typeahead: '=',
            typeaheadCallback: "="
        },
        link: function (scope, elem, attrs) {
            var template = '<div class="dropdown"><ul class="dropdown-menu" style="display:block;" ng-hide="!ngModel.length || !filitered.length || selected"><li ng-repeat="item in filitered = (typeahead | filter:{items:ngModel} | limitTo:20) track by $index" ng-click="click(item)" style="cursor:pointer" ng-class="{active:$index==active}"  ng-mousedown="mousedown(item)" ng-mouseenter="mouseenter($index)"><a>{{item.items}}</a></li></ul></div>'

            elem.bind('blur', function () {
                $timeout(function () {
                    scope.selected = true
                }, 100)
            })

            elem.bind("keydown", function ($event) {
                if ($event.keyCode == 38 && scope.active > 0) { // arrow up
                    scope.active--
                    scope.$digest()
                } else if ($event.keyCode == 40 && scope.active < scope.filitered.length - 1) { // arrow down
                    scope.active++
                    scope.$digest()
                } else if ($event.keyCode == 13) { // enter

                    if (scope.ngModel == '') {

                        $rootScope.enterCount = Number($rootScope.enterCount) + 1;
                        if (Number($rootScope.enterCount) == 4) {

                            $rootScope.enterCount = 1;
                            $rootScope.paymentPanelOn();
                        }
                    } else {
                        if (Number($rootScope.ente) == 1) {
                            scope.$apply(function () {
                                scope.click(scope.filitered[scope.active]);
                                //if (scope.filitered.length == 1) { scope.click(scope.filitered[scope.active]);   } else {
                                //    if (Number($rootScope.ente) == 1) { scope.click(scope.filitered[scope.active]);   } else {
                                //        $rootScope.ente = Number($rootScope.ente) + 1;
                                //    }
                                //}
                            })
                        } else {
                            //if (scope.ngModel == scope.filitered[scope.active].bc) {
                            //            scope.click(scope.filitered[scope.active]);// $rootScope.ente = 0;
                            //        }
                            // console.log(scope.filitered[scope.active].bc);
                            scope.$apply(function () {
                                if (scope.filitered.length == 1) {
                                    if (scope.ngModel == scope.filitered[scope.active].bc) {
                                        scope.click(scope.filitered[scope.active]);
                                    }

                                }
                                else {
                                    if (Number($rootScope.enterUse) == 2) {

                                        scope.click(scope.filitered[scope.active]); $rootScope.enterUse = 1;
                                    } else {
                                        $rootScope.enterUse = 2;
                                    }

                                }
                            })


                            //console.log('BarCode');
                        }
                    }
                }
            })

            scope.click = function (item) {
                if (angular.isUndefined(item)) { } else {
                    scope.ngModel = item.items
                    scope.selected = item
                    if (scope.typeaheadCallback) {
                        scope.typeaheadCallback(item)
                    }
                    elem[0].blur()
                }
            }

            scope.mouseenter = function ($index) {
                scope.active = $index
            }
            scope.mousedown = function (item) {
                if (angular.isUndefined(item)) { } else {
                    scope.ngModel = item.items
                    scope.selected = item
                    if (scope.typeaheadCallback) {
                        scope.typeaheadCallback(item)
                    }
                    elem[0].blur()
                }
            }
            scope.$watch('ngModel', function (input) {
                if (scope.selected && scope.selected.name == input) {
                    return
                }

                scope.active = 0
                scope.selected = false

                // if we have an exact match and there is only one item in the list, automatically select it
                //if (angular.isUndefined(scope.filitered) || scope.filitered == "") { } else {
                //    if (input && scope.filitered.length == 1) { // && scope.filitered[0].name.toLowerCase() == input.toLowerCase()
                //        scope.click(scope.filitered[0])
                //    }
                //}
            })

            elem.after($compile(template)(scope))
        }
    }
}]);
 