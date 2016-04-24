angular.module( 'PollApp' )
    .controller( 'PollCtrl', function( $scope, $firebase )
    {

        // Firebase Address.
        var firebaseAddress = new Firebase( "https://shining-heat-6023.firebaseio.com/Polls/" );

        // Automatically syncs everywhere in real-time.
        $scope.polls = $firebase( firebaseAddress );

        // Create basic objects.
        $scope.selectedPoll = '';
        $scope.selectedPollOptions = [];
        $scope.load = true;

        /**
         * Select Poll
         * -----------
         * Selects a poll from the polls list.
         * Moves the poll data to a separate object from the Firebase object.
         * This gives it more flexibility with it's own construct and data types.
         *
         * An example:
         *  The Firebase will return values as a string type, whilst Google Charts has to convert them into numbers.
         *  - Note the parseInt.
         *
         * Because of this there was a need to create a watcher, which watched for any incoming changes.
         * **/

        // Loading poll from the list (into the Firebase object).
        $scope.selectPoll = function ( id )
        {
            // Doesn't run on initial watch.
            if ( id )
            {
                // Holds selected Polls ID.
                $scope.selectedPoll = id;

                // Clean poll options object.
                $scope.selectedPollOptions = [];

                // Clean Google Chart data.
                pieChart.data = [];

                // Populate the chart's title from the Firebase object.
                pieChart.options.title = $scope.polls[id].name;

                // Google Chart requires that the column name is first in the dataset row - this saves us pain in the long run later on.
                pieChart.data.push( ['option', 'value'] );

                // Populate 'chart.data' with values from the Firebase - don't forget to paseInt the values, or it will not draw the chart.
                for ( i = 0; i < $scope.polls[id].options.length; i++ )
                {
                    if ( $scope.polls[id].options[i][0] && $scope.polls[id].options[i][1] )
                    {
                        // Resets the value if you do not have a numeric value.
                        var val = parseInt( $scope.polls[id].options[i][1] );
                        var option = [$scope.polls[id].options[i][0], val];

                        // Push data from the Firebase object to the Chart data object.
                        pieChart.data.push( option );

                        // Push the options from the Firebase Object to the Poll Options object.
                        $scope.selectedPollOptions.push( $scope.polls[id].options[i] );
                    }
                }
                $scope.chart = pieChart;
            }
        };

        // Deep watch for the Firebase object - allows the chart to update in real-time.
        $scope.$watch( 'polls', function ()
        {
            $scope.selectPoll( $scope.selectedPoll );
        }, true);

        // Data loaded from Firebase object - used to switch off the loader.
        $scope.polls.$on( "loaded", function ()
        {
            $scope.load = false;
        });

        // Vote on the Poll
        $scope.vote = function ( index )
        {

            // Calculate the new total.
            index ++;

            // Adds +1 to the index to compensate for the first row of the Chart data not being poll options.
            if ( angular.isNumber( pieChart.data[index][1] ))
            {
                newTotal = parseInt( pieChart.data[index][1] ) + 1;
            }
            else {
                newTotal = 1
            }

            // Moves the index back one.
            index--;

            // Update the values in the Firebase object.
            $scope.polls[$scope.selectedPoll].options[index][1] = newTotal;

            // Saves changes to the object and to the remote Firebase database.
            $scope.polls.$save();
        };

        // Adds "other" option to the selected poll.
        $scope.addOther = function ()
        {
            if ( $scope.vote.optionOther )
            {
                // Adds new options to the Firebase object with a single save.
                $scope.polls[$scope.selectedPoll].options.push ( [$scope.vote.optionOther, 1] );

                // Save the Firebase object - this updates the Firebase database.
                $scope.polls.$save();

                // Clears the "other" form field.
                $scope.vote.optionOther = '';
            }
        };

        /***
         * Google Charts
         * -------------
         * Google Charts provides a way to visualise data onto the website.
         * Used both Pie, and Bar charts.
         * ***/

        // Pie Chart
        var pieChart = {};
        pieChart.type = "PieChart";
        // Source: https://developers.google.com/chart/interactive/docs/gallery/piechart
        pieChart.options = {
            title: '',
            chartArea: {
                left: 30,
                top: 30,
                width: "300",
                height: "300"
            },
            sliceVisibilityThreshold: 0,
            displayExactValues: true,
            pieSliceText: 'percentage',
            width: 400,
            height: 300,
            is3D: false,
            fontColor: '#fff',
            color: '#fff',
            backgroundColor: '#323232',
            'legend': {
                'textStyle': {
                    'color': 'white'
                }
            },
            'titleTextStyle': {
                'color': 'white',
                'fontSize': 15
            },
            slices: {}
        };

        // Bar Chart
        var barChart = {};
        barChart.type = "BarChart";
        // Source: https://developers.google.com/chart/interactive/docs/gallery/barchart#stacked-bar-charts
        barChart.options = {
            title: '',
            chartArea: {
                left: 30,
                top: 30,
                width: "300",
                height: "300"
            },
            bars: 'horizontal',
            bar: {
                groupWidth: "95%"
            },
            legend: {
                position: "none"
            },
            isStacked: false
        };

        /***
         * Form Methods
         * ------------
         * This section is used for the forms.
         * e.g. Create a poll form.
         * ***/

        // Reset the form
        $scope.resetForm = function ()
        {
            $scope.pollForm = {};
            $scope.pollForm.options = [];
        };

        // Call one reset on load for object declaration
        $scope.resetForm();

        // Add a poll option to the creation form
        $scope.addPollOption = function ()
        {
            $scope.pollForm.options.push( ['', '0'] );
        };

        // Remove poll option from the form
        $scope.removeOption = function ( index )
        {
            $scope.pollForm.options.splice( index, 1 );
        };

        // Create a new poll
        $scope.pollCreate = function ()
        {
            // Add a poll to the Firebase object - this will in turn, update at to the server.

            // Checks for empty options.
            for ( i = 0; i < $scope.pollForm.options.length; i++ )
            {
                // Makes sure there are no empty options.
                if ( angular.isUndefined($scope.pollForm.options[i][0]) || $scope.pollForm.options[i][0]=='' )
                {
                    $scope.pollForm.options.splice( i, 1 )
                }
            }
            if ( $scope.pollForm.name && ( $scope.pollForm.options.length>0 ))
            {
                // Adds the new form to the Firebae object - updates automatically in the Firebase database.
                $scope.polls.$add($scope.pollForm);

                // Resets the poll creation form.
                $scope.resetForm();
            }
        };
    });
