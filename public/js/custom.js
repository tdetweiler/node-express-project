
$(document).ready(function(){
    $('.delete-account').on('click touchend', function(e){
        e.preventDefault();
        deleteAccount($(this));
    })
});


function deleteAccount(account){
    var confirmation = confirm('Are you sure?');
    var accountId = account.attr('account-id');

    if(!confirmation){
        return false;
    }else{
        $.ajax({
            type: 'DELETE',
            url: '/users/delete/'+accountId,
        }).done(function(response){
            account.parent().remove();
        });
    }
}