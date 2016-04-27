angular
    .module ( 'PollApp' )
    .controller ( 'PollCtrl', function ( $scope, $firebase )
    {

        // Firebase Address.
        var firebaseAddress = new Firebase ( "https://shining-heat-6023.firebaseio.com/Poll" );

        // Automatically syncs everywhere in real-time.
        $scope.firebasePolls = $firebase ( firebaseAddress );

        // Create basic objects.
        $scope.userSelectedPoll = '';
        $scope.userSelectedPollOptions = [];
        $scope.hasLoaded = true;

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
        $scope.selectPoll = function ( firebasePollID )
        {
            // Doesn't run on initial watch.
            if ( firebasePollID )
            {
                // Clean Google Chart data.
                pieChart.data = [];

                // Holds selected Polls ID.
                $scope.userSelectedPoll = firebasePollID;

                // Clean poll options object.
                $scope.userSelectedPollOptions = [];

                // Populate the chart's title from the Firebase object.
                pieChart.options.title = $scope.firebasePolls[firebasePollID].name;

                // Google Chart requires that the column name is first in the dataset row - this saves us pain in the long run later on.
                pieChart.data.push ( ['option', 'value'] );

                // Populate 'chart.data' with values from the Firebase - don't forget to paseInt the values, or it will not draw the chart.
                for ( interger = 0; interger < $scope.firebasePolls[firebasePollID].options.length; interger++ )
                {
                    if ( $scope.firebasePolls[firebasePollID].options[interger][0] && $scope.firebasePolls[firebasePollID].options[interger][1] )
                    {
                        // Resets the value if you do not have a numeric value.
                        var dataValue = parseInt ( $scope.firebasePolls[firebasePollID].options[interger][1] );
                        var userSelectedOption = [$scope.firebasePolls[firebasePollID].options[interger][0], dataValue];

                        // Push data from the Firebase object to the Chart data object.
                        pieChart.data.push ( userSelectedOption );

                        // Push the options from the Firebase Object to the Poll Options object.
                        $scope.userSelectedPollOptions.push ( $scope.firebasePolls[firebasePollID].options[interger] );
                    }
                }
                $scope.chart = pieChart;
            }
        };

        // Deep watch for the Firebase object - allows the chart to update in real-time.
        $scope.$watch ( 'firebasePolls', function ()
        {
            $scope.selectPoll ( $scope.userSelectedPoll );
        }, true );

        // Data loaded from Firebase object - used to switch off the loader.
        $scope.firebasePolls.$on ( "loaded", function ()
        {
            $scope.hasLoaded = false;
        });

        // Vote on the Poll
        $scope.vote = function ( index )
        {

            // Calculate the new total.
            index ++;

            // Adds +1 to the index to compensate for the first row of the Chart data not being poll options.
            if ( angular.isNumber ( pieChart.data[index][1] ) )
            {
                newTotal = parseInt ( pieChart.data[index][1] ) + 1;
            }
            else
            {
                newTotal = 1;
            }

            // Moves the index back one.
            index--;

            // Update the values in the Firebase object.
            $scope.firebasePolls[$scope.userSelectedPoll].options[index][1] = newTotal;

            // Saves changes to the object and to the remote Firebase database.
            $scope.firebasePolls.$save ();
        };

        // Adds "other" option to the selected poll.
        $scope.addOther = function ()
        {
            if ( $scope.vote.optionOther )
            {
                // Adds new options to the Firebase object with a single save.
                $scope.firebasePolls[$scope.userSelectedPoll].options.push ( [$scope.vote.optionOther, 1] );

                // Save the Firebase object - this updates the Firebase database.
                $scope.firebasePolls.$save ();

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
            $scope.firebaseFormPoll = {};
            $scope.firebaseFormPoll.options = [];
        };

        // Call one reset on load for object declaration
        $scope.resetForm ();

        // Add a poll option to the creation form
        $scope.addPollOption = function ()
        {
            $scope.firebaseFormPoll.options.push ( ['', '0'] );
        };

        // Remove poll option from the form
        $scope.removeOption = function ( index )
        {
            $scope.firebaseFormPoll.options.splice ( index, 1 );
        };

        // Create a new poll
        $scope.pollCreate = function ()
        {
            // Add a poll to the Firebase object - this will in turn, update at to the server.

            // Checks for empty options.
            for ( interger = 0; interger < $scope.firebaseFormPoll.options.length; interger++ )
            {
                // Makes sure there are no empty options.
                if ( angular.isUndefined ( $scope.firebaseFormPoll.options[interger][0] ) || $scope.firebaseFormPoll.options[interger][0] == '' )
                {
                    $scope.firebaseFormPoll.options.splice( interger, 1 )
                }
            }

            if ( $scope.firebaseFormPoll.name && ( $scope.firebaseFormPoll.options.length > 0 ) )
            {
                // Adds the new form to the Firebase object - updates automatically in the Firebase database.
                $scope.firebasePolls.$add ( $scope.firebaseFormPoll );

                // Resets the poll creation form.
                $scope.resetForm ();
            }
        };
    }
);