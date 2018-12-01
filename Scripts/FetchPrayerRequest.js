var baseUrl = "http://localhost:54011/api/PrayerRequest";

var prayerRequestIdToIsCurrent = [];
var initialPagingNo = 1;
var totalPage = 1;
var isInitialLoad = true;

$(document).ready(function (){
	 GetPrayerRequest(initialPagingNo);	 
});

function AddNewPrayerRequest(){
	GetDateTime();
	$('#newPrayerRequestCard').show();
	
}

function GetDateTime() {
    var date = new Date();
    document.getElementById('staticDate').value = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
}

function CloseModal(){
	$('#newPrayerRequestCard').hide();
}

function ClearModalInput(){
	$('#newPrayerRequestCard').find('input:text').val(''); 
	$('#newPrayerRequestCard').find('textarea').val(''); 
}

function BuildPrayerRequestCards(data){
	//totalPage = data.paging.pageCount;
	$.each(data["data"], function(key,prayerRequestDetail){ 
	 			var prayerRequestCard = $([
	 				'<div class="card border-info mb-4 prayerCard" style="max-width: 40rem;">',
					  '<div class="card-header">' + prayerRequestDetail.date.substr(0,10) + '</div>',
						  '<div class="card-body">',
							    '<h4 class="card-title">'+ prayerRequestDetail.name + '</h4>',
    							 '<p class="card-text">'+ prayerRequestDetail.request +'</p>',
  							'</div>',
  							'<div class="card-footer text-muted">',
//					    		'<a href="javascript:void(0)" class="card-link" onclick="ToggleHeartIconStyle(\''+ prayerRequestDetail.id +'\')"><span class="badge badge-pill badge-dark" id = "heart'+ prayerRequestDetail.id +'">Like</span></a>',
					    		'<a href="javascript:void(0)" class="card-link" onclick="MarkPrayerRequestPrayed(\''+ prayerRequestDetail.id +'\')"><span class="badge badge-pill badge-dark" id = "prayed'+ prayerRequestDetail.id +'">Prayed</span></a>',
					    		'<a href="javascript:void(0)" class="card-link" onclick="DeletePrayerRequest(\''+ prayerRequestDetail.id +'\')"><span class="badge badge-pill badge-dark">Delete</span></a>',
						  	'</div>',
					'</div>'].join('\n'));					
				//$('#prayerBoard').append(prayerRequestCard);
				if(prayerRequestDetail.isCurrent){
					$('#openPrayer').append(prayerRequestCard);										
				}else{
					$('#closePrayer').append(prayerRequestCard);
					// $('#prayerBoard').append($('#closePrayer'));
					// $('#closePrayer').show();
				}
				
				prayerRequestIdToIsCurrent.push({key:prayerRequestDetail.id, value:prayerRequestDetail.isCurrent})
	 		});
	SetPrayIconStyle();		
	SetupPagination(data);
	
	// if(isInitialLoad){
	// 	SetupPagination(data);
	// 	isInialLoad = false;
	// }
	// else{
	// 	RefreshPaging(data);
	// }
}

function ClearPrayerRequestCards(){
	$('.prayerCard').remove();
	prayerRequestIdToIsCurrent = [];
}

//prevent enter key to submit form
$(document).on("keypress", ":input:not(textarea)", function(event) {
    return event.keyCode != 13;
});

function SubmitPrayerReuqest(){
	console.log("In submit prayer request method");
	if(!$('#nameInput').val()){
		$('#nameInput').val("Anonymous");	
	}
	$.ajax({
        url: baseUrl,
        type: 'POST',
        data: { "id": -1, "name": $('#nameInput').val(), "request": $('#requestInput').val(),"date": $('#staticDate').val(),"isCurrent": "true"}
    }).done(function(data){
		ClearPrayerRequestCards();
    	RefreshPaging();		
    	BuildPrayerRequestCards(data);
    	CloseModal();
    	ClearModalInput();
    });
}

function DeletePrayerRequest(id){

	swal({
        title: "Are you sure you want to delete this prayer reqeust?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
    }).then((isConfirm) => {
    	if (isConfirm.value) {
        		$.ajax({
        			url: baseUrl + '/' + id,
        			type: 'DELETE',
    			}).done(function(data){
    				ClearPrayerRequestCards();
    				BuildPrayerRequestCards(data);
			    	//RefreshPaging();
    				CloseModal();
    				ClearModalInput();
    			});
        }/* else {
            swal("Cancelled", "Saving has been cancelled.", "error");            
        }*/
    });
}

function MarkPrayerRequestPrayed(id){
	$.ajax({
        url: baseUrl + '/' + id,
        type: 'PUT',
        data: { "id": -1, "name": $('#nameInput').val(), "request": $('#requestInput').val(),"date": $('#staticDate').val(),"isCurrent": "true"}
    }).done(function(data){
		ClearPrayerRequestCards();
    	RefreshPaging();		
    	BuildPrayerRequestCards(data);
    	CloseModal();
    	ClearModalInput();
    	TogglePrayIconStyle(id);
    });	
}

function GetPrayerRequest(pageNo, isCurrent = true){
	// $.getJSON(baseUrl + "?pageNo=" + pageNo,function (data){
	//  		BuildPrayerRequestCards(data);
	//  });

	 $.getJSON(baseUrl + "/" + pageNo + "/" + isCurrent,function (data){
		BuildPrayerRequestCards(data);
	});
}

function TogglePrayIconStyle(id){
	var prayedId = "#prayed" + id;
	$(prayedId).removeClass('badge-dark');
	$(prayedId).addClass('badge-warning');
//	$(prayedId).toggleClass('badge-dark badge-warning');
}

function ToggleHeartIconStyle(id){
	var prayedId = "#heart" + id;
	$(prayedId).toggleClass('badge-dark badge-danger');
}

function SetPrayIconStyle(){
	for(var key in prayerRequestIdToIsCurrent){		
		if(prayerRequestIdToIsCurrent.hasOwnProperty(key)){			
			if(prayerRequestIdToIsCurrent[key].value == 0){				
				TogglePrayIconStyle(prayerRequestIdToIsCurrent[key].key);
			}
		}
	}	
}


function RefreshPaging(){

	$('.pagination').remove();
	$('#prayerBoardTab').removeData("twbs-pagination");
	$('#prayerBoardTab').unbind("page");
// 	if($('.pagination').data("twbs-pagination")){
//    		$('.pagination').twbsPagination('destroy');
//    	}

//    $('.pagination').twbsPagination({
//    	totalPages: data.paging.pageCount,
//    	visiblePages: 5,
//    	startPage: 1,     
   
//    // callback function
// 		onPageClick: function (event, page) {		
// 			ClearPrayerRequestCards();
// 			GetPrayerRequest(page, data["data"][0].isCurrent);
//     		CloseModal();
//     		ClearModalInput();  
//     		}           
//    });
}


function ShowOpenPrayer(){
	ClearPrayerRequestCards();
	RefreshPaging();	
	GetPrayerRequest(initialPagingNo);
	$('#closePrayer').hide();
	$('#openPrayer').show();
}

function ShowClosePrayer(){
	ClearPrayerRequestCards();
	RefreshPaging();
	GetPrayerRequest(initialPagingNo, isCurrent = false);
	$('#openPrayer').hide();
	$('#closePrayer').show();	
}

function SetupPagination(data){
	var totalPageForData = data.paging.pageCount;
	console.log("Paging is here: "+ totalPageForData)

	$('#prayerBoardTab').twbsPagination({
		totalPages: totalPageForData,
// the current page that show on start
		startPage: 1,

// maximum visible pages
		visiblePages: 5,

		initiateStartPageClick: false,

// variable name in href template for page number
//		hrefVariable: '{{number}}',

// Text labels
		// first: 'First',
		// prev: 'Previous',
		// next: 'Next',
		// last: 'Last',

// carousel-style pagination
		loop: false,

// callback function
		onPageClick: function (event, page) {		
		ClearPrayerRequestCards();
		GetPrayerRequest(page, data["data"][0].isCurrent);
    	CloseModal();
    	ClearModalInput();
		
//		$('.page-active').removeClass('page-active');
  //		$('#page'+page).addClass('page-active');
		},

// pagination Classes
/*		paginationClass: 'pagination',
		nextClass: 'next',
		prevClass: 'prev',
		lastClass: 'last',
		firstClass: 'first',
		pageClass: 'page',
		activeClass: 'active',
		disabledClass: 'disabled'*/
	});
}


