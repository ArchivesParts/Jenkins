'use strict';

(function (angular)
{
    /**
     * Controller for the Contract management pane
     * @param $scope
     * @param $http
     * @constructor
     */
    var ContractController = function ($scope, $http, $timeout, tools)
    {
        $scope.contracts = [];
        $scope.limit = 36;
        $scope.offset = 0;
        $scope.hoveredContract;
        $scope.roles = ['admin',
                        'demonstration',
                        'prospect',
                        'subscriber',
                        'test',
                        'web'];
        $scope.search = {search: '', role: 'subscriber'};
        $scope.content = 'Contract';

        $scope.getType = tools.getType;
        $scope.isEditable = tools.isEditable;
        $scope.sections = ['common', 'detail', 'parameters'];

        $scope.changeSection = function (section)
        {

            if (!$scope.form[section]) {

                $http.get('/api/contracts/id/' + $scope.currentEntity.id + '/additional/' + section
                ).then(function (response)
                        {
                            if (section === 'parameters') {
                                $scope.form[section] = response.data.parameters;
                                if (response.data.features) {
                                    $scope.form[section] = $scope.form[section].concat(response.data.features);
                                }
                            } else {
                                $scope.form[section] = response.data;
                            }
                            $('#entity-edit').modal();
                        });
            }
            $scope.currentSection = section;
        }

        $scope.saveChange = function ()
        {
            var rowParams = {};
            for (var section in $scope.updatedForm) {
                for (var field in $scope.updatedForm[section]) {
                    rowParams[field] = $scope.form[section][field];
                }
            }
            console.log(rowParams);
            $http({
                method: 'PUT',
                url: '/api/contracts/' + $scope.currentEntity.id,
                data: rowParams
            }).then(function (response)
            {
                console.log(response);
            });
        }
        $scope.edit = function (contract)
        {
            $scope.currentSection = 'common';
            $scope.form = [];
            $scope.updatedForm = [];
            $scope.currentEntity = contract;
            $http.get('/api/contracts/id/' + contract.id
            ).
                    then(function (response)
                    {
                        $scope.form[$scope.currentSection] = response.data;
                        $('#entity-edit').modal();
                        $('#TabModal').tab();
                    });
        };
        $scope.preview = function (contract)
        {
            $scope.previewContract = contract;
        };

        $scope.searchContracts = function (more)
        {
            if ($scope.searchPromise) {
                $timeout.cancel($scope.searchPromise);
            }
            $scope.searchPromise = $timeout(function ()
            {
                if (!more)$scope.offset = 0;
                var params = [];
                if ($scope.search.search && $scope.search.search.length > 0 ||
                    $scope.search.role !== 0) {
                    params.push('query/' + JSON.stringify($scope.search));
                }
                params.push('limit/' + $scope.limit);
                params.push('offset/' + $scope.offset);
                $http.get('/api/contracts/' + params.join('/')
                ).
                        then(function (response)
                        {
                            if (!more) {
                                $scope.contracts = response.data;
                            } else {
                                $scope.contracts = $scope.contracts.concat(response.data);
                            }
                            $scope.offset = $scope.contracts.length
                            $scope.loadMore = $scope.offset < response.headers('x-total');
                            console.log('Done : searchContracts');
                        });
            }, 1000);

        }
        $scope.searchContracts();
    };

    /**
     * Display short summary for a contract
     * @param $http
     * @returns {{restrict: string, replace: boolean, scope: {contract: string}, template: string, link: Function}}
     * @constructor
     */
    var ContractDirective = function ($http)
    {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                contract: '='
            },
            template: '<a href="#" ' +
                      'data-toggle="tooltip" ' +
                      'data-placement="top" ' +
                      'data-original-title="{{contract|contractTilePopup}}">{{contract|contractTile}}</a>',
            link: function (scope, element, attr, controller)
            {
                element.tooltip({html: true});
            }
        };
    };

    var contractTileFilter = function ()
    {
        return function (contract)
        {
            var result = contract.name;
            if (!contract.name) {
                result = 'unnamed contract :' + contract.id;
            }

            if ((contract.name).length > 30) {
                result = (contract.name).substr(0, 30) + '...';
            }
            return result;
        }
    };
    var contractTilePopupFilter = function ()
    {
        return function (contract)
        {
            var result = '';
            for (var entry in contract) {
                if (entry !== '$$hashKey')
                    result += entry + ': ' + contract[entry] + "<br>";

            }
            return result
        }
    };
    angular.module('baseoFiceApp')
            .controller('ContractCtrl', ['$scope', '$http', '$timeout', 'tools', ContractController])
            .directive('contract', ['$http', ContractDirective])
            .filter('contractTile', contractTileFilter)
            .filter('contractTilePopup', contractTilePopupFilter);

})(angular);
