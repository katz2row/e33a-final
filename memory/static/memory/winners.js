document.addEventListener('DOMContentLoaded', () => {
    //Convert the seconds time provided by the database to a hh:mm:ss format for the table.
    let timeConvert = document.querySelectorAll(".ind_best_time");

    for (k = 0; k < timeConvert.length; k++) {
        currentTimeValue = timeConvert[k].innerHTML;
        convertedTimeValue = new Date(currentTimeValue * 1000).toISOString().substr(11, 8);

        timeConvert[k].innerHTML = convertedTimeValue;
    }
})

//Use JQUery and Bootstrap's Data Tables to make the table sortable and add pagination.
$(document).ready(function () {
    $('#winnerscircletable').DataTable();
});

