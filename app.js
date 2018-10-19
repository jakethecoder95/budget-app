// Budget Controller
var budgetController = (function () {

    var Expense = function (id, description, value, catagory) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.catagory = catagory;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalExp) {
        if (totalExp > 0) {
            this.percentage = Math.round((this.value / data.totals.exp) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;

        data.allItemes[type].forEach(function (cur) {
            sum += cur.value
        });
        data.totals[type] = sum;
    };

    var addToCatagoryTotal = function (cat, value) {
        data.totals[cat] += value;
        data.totals['none'] = 0;
    };

    var deleteFromCatTotal = function (cat, value) {

        data.totals[cat] -= value;

        if (data.allItemes['exp'].length === 0) {
            data.totals['none'] = 100;
        }
    };

    var getCatSums = function () {
        var totals = data.totals;

        return {
            none: totals.none,
            misc: totals.misc,
            home: totals.home,
            transport: totals.transport,
            groceries: totals.groceries,
            insurance: totals.insurance,
            dining: totals.dining,
            entertainment: totals.entertainment,
        }
    };

    var orderCatSumsList = function () {
        var sorted = [];
        var catagoryObj = getCatSums();

        for (var cur in catagoryObj) {
            if (cur !== 'none') {
                sorted.push([cur, catagoryObj[cur]])
            }
        }

        sorted.sort(function (a, b) {
            return b[1] - a[1];
        });

        return sorted;
    };

    var data = {
        allItemes: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0,
            none: 100,
            misc: 0,
            home: 0,
            transport: 0,
            groceries: 0,
            insurance: 0,
            dining: 0,
            entertainment: 0,
        },
        budget: 0,
        percentSpent: -1
    }

    return {
        addItem: function (type, des, val, cat) {
            var newItem, ID;

            // Creat new ID
            if (data.allItemes[type].length > 0) {
                ID = data.allItemes[type][data.allItemes[type].length - 1].id + 1;
            } else ID = 0


            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val, cat);
                addToCatagoryTotal(cat, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItemes[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: function (type, id, cat, val) {
            var ids, index;

            //id = 3
            //data.allItemes[type]['id'];

            var ids = data.allItemes[type].map(function (current) {
                return current.id

            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItemes[type].splice(index, 1);
            }

            // Delete from the catagory sum
            if (type === 'exp') {
                deleteFromCatTotal(cat, val);
            }

        },

        calculateBudget: function () {

            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentSpent = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percetnSpent = -1;
            }
        },



        calculatePercentages: function () {

            data.allItemes.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.exp);
            });


            /*
            for (var i = 0; i <= data.allItemes['exp'].length; i++) {
                if (data.allItemes['exp'][i]) {
                    data.expPercent[i] = Math.round(100 * (data.allItemes['exp'][i].value / data.totals.exp));
                } else {
                    data.expPercent.splice(i, 1);
                }
            }
            */
        },

        getPercentages: function () {
            var allPerc = data.allItemes.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getCatPercentages: function () {
            var totals = data.totals;

            return {
                none: totals.none,
                misc: Math.round((totals.misc / totals.exp) * 100),
                home: Math.round((totals.home / totals.exp) * 100),
                transport: Math.round((totals.transport / totals.exp) * 100),
                groceries: Math.round((totals.groceries / totals.exp) * 100),
                insurance: Math.round((totals.insurance / totals.exp) * 100),
                dining: Math.round((totals.dining / totals.exp) * 100),
                entertainment: Math.round((totals.entertainment / totals.exp) * 100),
            }
        },

        getOrderedCatSums: function () {
            var sums = orderCatSumsList();
            return sums;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentSpent: data.percentSpent
            }
        },

        testing: function () {
            console.log(data);
        }
    };

})();

// UI Controller
var UIController = (function () {

    DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        inputCatagory: '.add__catagory',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        outputBudget: '.budget__value',
        outputInc: '.budget__income--value',
        outputExp: '.budget__expenses--value',
        outputPercent: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
        piechart: '.piechart',
        forwardBtn: '.chart__btn__forward',
        backBtn: '.chart__btn__back',
        doughnutChart: '.doughnut__chart',
        chartContainer: '.chart-container',
        overviewContainer: '.overview__container',
        detailsContainer: '.details__container',
        row: '.row',
        header: '.header',
        details: '.details'

    }

    var formatNumber = function (num, type) {

        /*
        + or - before number 
        exactly 2 decimal points
        comma separating the thousand
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 2310, output 2,310
        }

        dec = numSplit[1];

        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;

    }

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    }

    var catagoriesHTML = {

        misc: '<div class="row misc-div"><div class="icon-div"><i class="fa        fa-question-circle"></i></div><div class="content-div"><div class="title">Misc & Checks</div><div class="description">You spent a total of <b class="misc-exp">%amt%</b> on Misc & Checks</div></div></div>',


        home: '<div class="row home-div"><div class="icon-div"><i class="fa fa-wrench"></i></div><div class="content-div"><div class="title">Home & Utilities</div><div class="description">You spent a total of <b class="home-exp">%amt%</b> on Home goods</div></div></div>',

        transport: '<div class="row transport-div"><div class="icon-div"><i class="fa fa-car"></i></div><div class="content-div"><div class="title">Transportation</div><div class="description">You spent a total of <b class="transport-exp">%amt%</b> on Transportation</div></div></div>',

        groceries: '<div class="row groceries-div"><div class="icon-div"><i class="fa fa-shopping-basket"></i></div><div class="content-div"><div class="title">Groceries</div><div class="description">You spent a total of <b class="groceries-exp">%amt%</b> on Groceries</div></div></div>',

        insurance: '<div class="row insurance-div"><div class="icon-div"><i class="fa fa-piggy-bank"></i></div><div class="content-div"><div class="title">Insurance</div><div class="description">You spent a total of <b class="insurance-exp">%amt%</b> on Insurance</div></div></div>',

        dining: '<div class="row dining-div"><div class="icon-div"><i class="fa fa-utensils"></i></div><div class="content-div"><div class="title">Restaurants and Dining</div><div class="description">You spent a total of <b class="dining-exp">%amt%</b> on Restaurants and Dining</div></div></div>',

        entertainment: '<div class="row entertainment-div"><div class="icon-div"><i class="fa fa-theater-masks"></i></div><div class="content-div"><div class="title">Entertainment</div><div class="description">You spent a total of <b class="entertainment-exp">%amt%</b> on Entertainment</div></div></div>'
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either income or expense
                catagory: document.querySelector(DOMstrings.inputCatagory).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml;

            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            // Replace the placeholder text with some actual data 
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        addCatagory: function (id, cat) {
            var input = document.getElementById('exp-' + id);
            return input.classList.add(cat)
        },

        toggleCatagoryFields: function () {
            document.querySelector(DOMstrings.inputCatagory).classList.toggle('hide');
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID)
            el.parentNode.removeChild(el)
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();

        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.outputBudget).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.outputInc).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.outputExp).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentSpent > 0) {
                document.querySelector(DOMstrings.outputPercent).textContent = obj.percentSpent + '%';
            } else {
                document.querySelector(DOMstrings.outputPercent).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }

            });

        },

        displayMonth: function () {
            var now, year;
            now = new Date();
            //var Christmas = new Date(2016, 11, 25);

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            day = now.getDay();

            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        displayCatagoriesList: function (sums) {
            var count, plusBTN;

            // Remove current html and normal size
            document.querySelector(DOMstrings.overviewContainer).innerHTML = '';
            document.querySelector(DOMstrings.overviewContainer).style.height = '600px';

            // Add new/reordered html
            count = 0;
            sums.forEach(function (cur) {
                var current = cur[0];

                if (cur[1] > 0) {
                    document.querySelector(DOMstrings.overviewContainer).insertAdjacentHTML('beforeend', catagoriesHTML[current]);
                    document.querySelector('.' + current + '-exp').innerHTML = cur[1];

                    if (count > 3) {
                        document.querySelector(DOMstrings.overviewContainer).lastChild.style.display = 'none';
                    }
                    count += 1;
                }
            });

            // Make plus button appear when list exceeds 4 and leave when it is less
            plusHTML = '<div class="plus-icon"><i class="fa fa-plus"></i></div>';
            plusBTN = document.querySelector('.plus-icon');

            if (plusBTN === null && count > 4) {
                document.querySelector(DOMstrings.overviewContainer).insertAdjacentHTML('beforeend', plusHTML);
            } else if (plusBTN && count <= 4) {
                document.querySelector('.descriptions__container').removeChild(plusBTN);
            }

        },

        showOverflowItems: function () {
            var containerList, loops, plusBTN;

            // Remove plus button
            plusBTN = document.querySelector('.plus-icon');
            plusBTN.parentNode.removeChild(plusBTN);

            // Insert minus button
            minusHTML = '<div class="minus-icon"><i class="fa fa-minus"></i></div>';
            document.querySelector(DOMstrings.overviewContainer).insertAdjacentHTML('beforeend', minusHTML);

            // Show overflow items
            containerList = document.querySelector(DOMstrings.overviewContainer).children;
            loops = containerList.length - 4;

            document.querySelector(DOMstrings.overviewContainer).style.height = (593 + (143 * loops)) + 'px';

            if (loops > 0) {
                for (loops; loops > 0; loops--) {
                    containerList[containerList.length - loops].style.display = "grid";
                    containerList[containerList.length - loops].classList.add('show');
                }
            }

        },

        hideOverflowItems: function () {
            var containerList, loops, plusBTN;

            // Remove minus button
            minusBTN = document.querySelector('.minus-icon');
            minusBTN.parentNode.removeChild(minusBTN);

            // Insert plus button
            plusHTML = '<div class="plus-icon"><i class="fa fa-plus"></i></div>';
            document.querySelector(DOMstrings.overviewContainer).insertAdjacentHTML('beforeend', plusHTML);

            // Hide overflow items
            containerList = document.querySelector(DOMstrings.overviewContainer).children;
            loops = containerList.length - 5;

            document.querySelector(DOMstrings.overviewContainer).style.height = '593px';

            if (loops > 0) {
                for (loops; loops > 0; loops--) {
                    containerList[(containerList.length - 1) - loops].style.display = "none";
                    containerList[(containerList.length - 1) - loops].classList.remove('show');
                }
            }
        },

        changedType: function () {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue + ',' +
                DOMstrings.inputCatagory);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        slideToNextSection: function () {
            var section1Cls, section2Cls, buttonFwd, buttonBack

            section1Cls = document.querySelector(DOMstrings.container).classList;
            section2Cls = document.querySelector(DOMstrings.piechart).classList;

            buttonFwd = document.querySelector(DOMstrings.forwardBtn).classList;
            buttonBack = document.querySelector(DOMstrings.backBtn).classList;

            if (section1Cls.length < 3) {
                section1Cls.add('move-left-0');
                buttonFwd.add('fade-out');
            } else {
                section1Cls.toggle('move-right-0');
                section1Cls.toggle('move-left-0');

                buttonFwd.toggle('fade-in');
                buttonFwd.toggle('fade-out');
            }

            if (section2Cls.length < 2) {
                section2Cls.add('move-left-1');
                buttonBack.add('fade-in');
            } else {
                section2Cls.toggle('move-right-1');
                section2Cls.toggle('move-left-1');

                buttonBack.toggle('fade-out');
                buttonBack.toggle('fade-in');
            }

        },

        slideToNextDiv: function () {
            var detailsCls, overviewCls;

            overviewCls = document.querySelector(DOMstrings.overviewContainer).classList;
            detailsCls = document.querySelector(DOMstrings.detailsContainer).classList;

            if (overviewCls.length < 2) {
                overviewCls.add('move-left-display-none');
            } else {
                overviewCls.toggle('move-right-delay');
                overviewCls.toggle('move-left-display-none');
            }

            if (detailsCls < 2) {
                detailsCls.add('move-left-1');
            } else {
                detailsCls.toggle('move-right-1');
                detailsCls.toggle('move-left-1');
            }

        },

        getChartDate: function () {
            var now, months;

            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

            return {
                month: months[now.getMonth()],
                year: now.getFullYear()
            }
        },

        makeDoughnutChart: function (per, exp) {
            var chart, catagories, titleDates, title;

            titleDates = UIController.getChartDate();
            title = "Expenses: " + titleDates.month + ' ' + titleDates.year;
            catagories = ['No Expences', 'Misc & Checks', 'Home & Utilities', 'Transportation', 'Groceries', 'Insurance', 'Restaurants & Dining', 'Entertainment'];
            chart = document.querySelector(DOMstrings.doughnutChart).getContext('2d');

            Chart.defaults.global.defaultFontFamily = 'Lato';
            Chart.defaults.global.defaultFontSize = 18;
            Chart.defaults.global.defaultFontColor = '#777';
            Chart.pluginService.register({
                beforeDraw: function (chart) {
                    if (chart.config.options.elements.center) {
                        //Get ctx from string
                        var ctx = chart.chart.ctx;

                        //Get options from the center object in options
                        var centerConfig = chart.config.options.elements.center;
                        var fontStyle = centerConfig.fontStyle || 'Arial';
                        var txt = centerConfig.text;
                        var color = centerConfig.color || '#000';
                        var sidePadding = centerConfig.sidePadding || 20;
                        var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2)
                        //Start with a base font of 30px
                        ctx.font = "30px " + fontStyle;

                        //Get the width of the string and also the width of the element minus 10 to give it 5px side padding
                        var stringWidth = ctx.measureText(txt).width;
                        var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

                        // Find out how much the font can grow in width.
                        var widthRatio = elementWidth / stringWidth;
                        var newFontSize = Math.floor(30 * widthRatio);
                        var elementHeight = (chart.innerRadius * 2);

                        // Pick a new font size so it will not be larger than the height of label.
                        var fontSizeToUse = Math.min(newFontSize, elementHeight);

                        // Set font settings to draw it correctly.
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
                        var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
                        ctx.font = fontSizeToUse + "px " + fontStyle;
                        ctx.fillStyle = color;

                        //Draw text in center
                        ctx.fillText(txt, centerX, centerY);
                    }
                }
            });

            return {

                doughnutChart: new Chart(chart, {
                    type: 'doughnut',
                    innerRadius: '15%',
                    radius: '90%',

                    data: {
                        labels: catagories,
                        datasets: [{
                            data: per,
                            backgroundColor: [
                                'rgba(235, 235, 235, 1)',
                                'rgba(200, 200, 200, 0.6)',
                                'rgba(255, 99, 132, 0.6)',
                                'rgba(54, 162, 235, 0.6)',
                                'rgba(255, 206, 86, 0.6)',
                                'rgba(75, 192, 192, 0.6)',
                                'rgba(153, 102, 255, 0.6)',
                                'rgba(255, 159, 64, 0.6)'],
                            borderColor: [
                                'rgba(200, 200, 200, 1)',
                                'rgba(200, 200, 200, 1)',
                                'rgba(255,99,132,1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],
                            borderWidth: [2, 0, 0, 0, 0, 0, 0, 0],
                            hoverBorderWidth: 1,
                        }],
                    },
                    options: {
                        responsive: false,
                        legend: {
                            display: false,
                        },
                        title: {
                            display: true,
                            text: title,
                            fontSize: 30
                        },
                        cutoutPercentage: 75,
                        elements: {
                            center: {
                                text: '$' + exp,
                                color: '#444', // Default is #000000
                                fontStyle: 'Arial', // Default is Arial
                                sidePadding: 20, // Defualt is 20 (as a percentage)
                                backgroundColor: 'red',
                                display: 'block'
                            }
                        },
                        tooltips: {
                            callbacks: {
                                label: function (tooltipItem, chartData) {
                                    return chartData.labels[tooltipItem.index] + ': ' + chartData.datasets[0].data[tooltipItem.index] + '%';
                                }
                            }
                        },
                        animation: {
                            duration: 2000,
                            easing: 'easeInOutQuart'
                        }
                    }

                }),
            }

        },

        getChartCanvas: function () {
            var container, canvas;

            canvas = '<canvas class="doughnut__chart" width="1200" height="600"></canvas>';
            container = document.querySelector(DOMstrings.chartContainer);

            container.insertAdjacentHTML('beforeend', canvas);
        },

        deleteChartCanvas: function () {
            var container, canvas;

            container = document.querySelector(DOMstrings.chartContainer);
            canvas = document.querySelector(DOMstrings.doughnutChart);

            container.removeChild(canvas);
        },

        displayCatListItems: function (cat) {
            var newItems, details;

            newItems = document.getElementsByClassName(cat);
            details = document.querySelector(DOMstrings.details);

            details.innerHTML = ''
            listLength = newItems.length;

            for (var i = 0; i < listLength; i++) {
                document.querySelector(DOMstrings.details).insertAdjacentHTML('beforeend', newItems[i].outerHTML);
            }
        },

        displayDetailDiv: function (cat) {
            var header, newHtml;

            newHtml = catagoriesHTML[cat];

            header = document.querySelector(DOMstrings.header);
            detail = document.querySelector(DOMstrings.details);

            header.insertAdjacentHTML('afterbegin', newHtml);
            header.firstChild.insertAdjacentHTML('beforeend', '<div class="percent">100%</div>');
        },

        clearDetailContainer: function () {
            document.querySelector(DOMstrings.header).innerHTML = '';
            document.querySelector(DOMstrings.details).innerHTML = '';
        },

        displayCatPercentages: function (cat, per) {
            cat = cat.split('-');
            document.querySelector('.percent').textContent = per[cat[0]] + '%';
        },

        displayDetailsSum: function (sum, cat) {
            var sumContainer = document.getElementsByClassName(cat + '-exp');

            sumContainer[1].innerHTML = '$' + sum;
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();

// Global App Controller
var Controller = (function (budgetCtrl, UICtrl) {

    var setupEventListenters = function () {
        var DOM = UICtrl.getDOMstrings();

        // Call addItems
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }

        });

        // Call deleteItems
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.details).addEventListener('click', ctrlDeleteItem);


        // Alternate between 'inc' and 'exp'
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

        // Alternate between sections
        document.querySelector(DOM.forwardBtn).addEventListener('click', UICtrl.slideToNextSection);
        document.querySelector(DOM.backBtn).addEventListener('click', UICtrl.slideToNextSection);

        document.addEventListener('keydown', function (event) {

            if (event.keyCode === 39 || event.which === 39 ||
                event.keyCode === 37 || event.which === 37) {

                UICtrl.slideToNextSection();
                ctrlRenderChart();
            }
        });

        // Doughnut chart
        document.querySelector(DOM.forwardBtn).addEventListener('click', function () {
            ctrlRenderChart();
        });

        // Add catagory fields selection
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.toggleCatagoryFields);

        // Show overflow catagories on click
        document.querySelector(DOM.piechart).addEventListener('click', function (event) {
            var plusBTN, minusBTN;

            plusBTN = document.querySelector('.plus-icon');
            minusBTN = document.querySelector('.minus-icon');

            if (event.path[1] === plusBTN) {
                UICtrl.showOverflowItems();
            } else if (event.path[1] === minusBTN) {
                UICtrl.hideOverflowItems();
            }
        });

        // Slide to next div
        document.querySelector(DOM.overviewContainer).addEventListener('click', function (event) {
            var node, catagory;

            node = getNode(event);
            if (node) {
                catagory = node.classList[1];
                ctrlUpdateDetails(catagory);
                UICtrl.slideToNextDiv();
            }

        });
        document.querySelector('.fa-caret-left').addEventListener('click', function () {
            ctrlDisplayCatagoryList();
            UICtrl.slideToNextDiv();
            UICtrl.clearDetailContainer();
        });

    }

    var updateBudget = function () {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Dispaly the budget
        UICtrl.displayBudget(budget);

    };

    var updateDetails = function () {
        var catagory, header;
        header = document.querySelector('.header');

        if (header.childElementCount > 0) {
            catagory = header.firstChild.classList[1];
            ctrlUpdateDetails(catagory);
        }
    }

    var updatePercentages = function () {
        // 1. calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. update UI with the new percentages
        UICtrl.displayPercentages(percentages);
    }

    var checkValueStatus = function () {
        var percentages, catagory, header;

        header = document.querySelector('.header');
        percentages = budgetCtrl.getCatPercentages();

        if (header.childElementCount > 0) {
            catagory = header.firstChild.classList[1];
            ctrlUpdateDetails(catagory);

            if (percentages[catagory] === 0 ||
                percentages[catagory] === NaN ||
                percentages[catagory] === undefined ||
                percentages[catagory] === Infinity) {

                    UICtrl.slideToNextDiv();
                    UICtrl.clearDetailContainer();
            }
        }
    }

    var getNode = function (e) {
        var node;

        if (event.path[2].classList[0] === 'row') {
            node = event.path[2];
        } else if (event.path[1].classList[0] === 'row') {
            node = event.path[1];
        } else if (event.path[0].classList[0] === 'row') {
            node = event.path[0];
        } else {
            node = null;
        }

        return node;
    }

    var ctrlAddItem = function () {
        var input, newItem;

        // 1. Get the feild input data 
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add item to budget contoller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value, input.catagory);

            // 3. Add the new item to the UI
            UICtrl.addListItem(newItem, input.type);
            if (input.type === 'exp') {
                UICtrl.addCatagory(newItem.id, newItem.catagory);
            }

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();

            // 7. Render chart
            if (input.type === 'exp') {
                ctrlRenderChart();
            }
            // 8. Update details page if active
            updateDetails();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID, cat, eventClassList, val, valElm, valArr;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        eventClassList = event.target.parentNode.parentNode.parentNode.parentNode.classList;
        cat = eventClassList[2];

        // Get deleted value
        valElm = event.target.parentNode.parentNode.parentNode.firstChild.innerHTML;
        if (valElm) {
            valArr = valElm.split(' ');
            val = parseInt(valArr[2]);
        }

        if (itemID) {

            //inc-1 to ['inc', 1]
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete item from the data structure
            budgetCtrl.deleteItem(type, ID, cat, val);

            // 2. Delete item from UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();

            // 5. Update chart
            ctrlRenderChart();

            // 6. Update details page if active
            updateDetails();

            checkValueStatus();

        }
    };

    var ctrlRenderChart = function () {
        var percentages, budget, percentagesObj, expences;

        // 1. Delet current chart
        UICtrl.deleteChartCanvas();

        // 2. Get/update chart data
        percentagesObj = budgetCtrl.getCatPercentages();
        budget = budgetCtrl.getBudget();

        percentages = Object.values(percentagesObj);
        expences = budget.totalExp.toFixed(2);

        // 3. Add chart canvas back to DOM
        UICtrl.getChartCanvas();

        // 4. Make chart
        UICtrl.makeDoughnutChart(percentages, expences);

        // 5. Display description list
        ctrlDisplayCatagoryList();

        // 6. Update details 
        updateCatAmounts()
    }

    var ctrlUpdateDetails = function (cat) {
        cat = (cat.split('-'))[0];

        // 1. Remove current content
        UICtrl.clearDetailContainer()

        // 2. Insert html
        UICtrl.displayDetailDiv(cat);

        // 3. Render percentage
        updateCatAmounts();

        // 4. Add list items
        UICtrl.displayCatListItems(cat);

    }

    var updateCatAmounts = function () {
        var cat, percentages, sums, sum, header;

        percentages = budgetCtrl.getCatPercentages();
        header = document.querySelector('.header');
        sums = budgetCtrl.getOrderedCatSums();

        if (header.childElementCount > 0) {
            cat = header.firstChild.classList[1]
            cat = cat.split('-');

            // Update percentages
            UICtrl.displayCatPercentages(cat[0], percentages);

            // Get/Update sums
            sums.forEach(function (cur) {
                if (cur[0] === cat[0]) {
                    sum = cur[1]
                }
            });
            if (sum) { UICtrl.displayDetailsSum(sum, cat[0]); }

        }
    }

    var ctrlDisplayCatagoryList = function () {
        var orderedSums, percentages

        // 1. Get ordered sums and percentages values
        orderedSums = budgetCtrl.getOrderedCatSums();
        percentages = budgetCtrl.getCatPercentages();

        // 2. Make html array and display it to UI
        UIController.displayCatagoriesList(orderedSums, percentages);

    }

    return {
        testing: function () { ctrlUpdateDetails('misc') },
        init: function () {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentSpent: -1
            })
            setupEventListenters();
        }
    }

})(budgetController, UIController);

Controller.init();