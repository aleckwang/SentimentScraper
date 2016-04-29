$(document).ready(function () {
    $("#search-bar").change(function () {
        $('#load').slideToggle();
        $('#listing').slideToggle();
        $('#graph').slideToggle();
        $.ajax({
            url: '/',
            type: 'POST',
            dataType: 'json',
            data: {
                search: $(this).val()
            },
            complete: function (resp) {
                if (resp.status === 200) {
                    sentiment = resp.responseJSON.sent;
                    var myChart = new Chart($('#graph'), {
                        type: 'line',
                        data: {
                            labels: resp.responseJSON.dates,
                            datasets: [{
                                label: 'Sentiment',
                                fill: false,
                                pointRadius: 1,
                                data: sentiment
                            }]
                        }
                    });
                    $('#load').slideToggle();
                    $('#name').text(resp.responseJSON.name + ': ');
                    $('#sent').text(sentiment[sentiment.length - 1]);
                    $('#listing').slideToggle();
                    $('#graph').slideToggle();
                }
            }
        });
    });
});