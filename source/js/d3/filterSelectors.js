$(function () {

    $.ajax({
        url: '/git/get-all-authors-email',
        method: 'GET',
    })
        .done(function (res) {
            var authorDropdown = $('#authorEmail');

            authorDropdown.append('<option value="">Any</option>');
            res.forEach(function (dropdown, authorEmail) {
                authorDropdown.append('<option value="' + authorEmail +'">'+ authorEmail + '</option>');
            }.bind(this, authorDropdown))

        })
        .fail(function (res) {
            var error = jQuery.parseJSON(res.responseText);
            alert(error.message)
        })
        .always(function () {
            $('#authorEmailLoader').remove();
        })



    $.ajax({
        url: '/git/get-all-repositories',
        method: 'GET',
    })
        .done(function (res) {
            var repositoriesDropdown = $('#repositories');

            repositoriesDropdown.append('<option value="">Any</option>');
            res.forEach(function (repositoriesDropdown, repository) {
                repositoriesDropdown.append('<option value="' + repository._id +'">'+ repository.name + '</option>');
            }.bind(this, repositoriesDropdown))

        })
        .fail(function (res) {
            var error = jQuery.parseJSON(res.responseText);
            alert(error.message)
        })
        .always(function () {
            $('#repositoriesLoader').remove();
        })


    

});