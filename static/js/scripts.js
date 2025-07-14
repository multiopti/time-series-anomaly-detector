$(document).ready(function() {
    $('#normal-form').submit(function(e) {
        e.preventDefault();
        var formData = new FormData(this);
        $.ajax({
            url: '/upload/normal',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                $('#normal-status').html('<div class="alert alert-success">' + response.message + '<br>Files: ' + response.files.join(', ') + '</div>');
            },
            error: function(xhr) {
                $('#normal-status').html('<div class="alert alert-danger">' + xhr.responseJSON.error + '</div>');
            }
        });
    });

    $('#test-form').submit(function(e) {
        e.preventDefault();
        var formData = new FormData(this);
        $.ajax({
            url: '/upload/test',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                $('#test-status').html('<div class="alert alert-success">' + response.message + '</div>');
            },
            error: function(xhr) {
                $('#test-status').html('<div class="alert alert-danger">' + xhr.responseJSON.error + '</div>');
            }
        });
    });
});