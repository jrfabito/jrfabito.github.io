var _body,_mainNavCurrent,_mainMenu,_aMenuItems,_aMainNav,_siteHeader,
_draggable,_viewportWidth,_dragStart,_isMainPage=true,_detailView,_siteScroller;

_body = document.querySelectorAll('body')[0];
_mainNavCurrent = "main-nav-current";
_mainMenu = document.getElementById("main-menu");
_aMenuItems = document.querySelectorAll(".menu-item");
_aMainNav = document.querySelectorAll(".main-nav a");
_siteHeader = document.querySelectorAll(".site-header")[0];
_detailView = document.getElementById("detail-view");
_siteScroller = document.getElementById("site-scroller");
_postsJsUrl = "/js/posts.js";

function getElementTransform(elem) {
	var transform = /matrix\([^\)]+\)/.exec(window.getComputedStyle(elem)['-webkit-transform']),
		props = {'x':1,'y':1,'scaleX':1,'scaleY':1};
	if( transform ) {
		transform = transform[0].replace('matrix(', '').replace(')', '').split(', ');
		props.scaleX = parseFloat(transform[0]);
		props.scaleY = parseFloat(transform[3]);
		props.x = parseFloat([transform[4]]);
		props.y = parseFloat([transform[5]]);
	}
	return props;
}

function setMainPageBool(){
	_isMainPage = getElementTransform(document.getElementById("site-scroller")).x ===0;
}

function resizeHandler(){
	if(_aMenuItems===undefined) return;
    _siteScroller.style.width = (window.innerWidth*2)+"px";
    for(var i=0;i<_aMenuItems.length;i++){
        var item = _aMenuItems[i];
        item.style.width = window.innerWidth+"px";
        item.style.height = window.innerHeight+"px";
    }
    _siteHeader.style.width = window.innerWidth+"px";
    _siteHeader.style.height = window.innerHeight+"px";
    _viewportWidth = window.innerWidth;
    if(!_isMainPage)
    {

    }
}

window.onresize = resizeHandler;

function scrollAnim(value)
{
	TweenMax.to(_mainMenu.parentNode,0.5,{scrollTo:{y:value}});
}

function getCurrentSectionNavigationElement(){
	for(var i=0;i<_aMainNav.length;i++){
		var navElement = _aMainNav[i];
		if(hasClass(navElement,_mainNavCurrent)){
			return navElement;
		}
	}
	return mainNav[0];
}

function getSectionNavigationElement(sectionName) {
	for(var i=0;i<_aMainNav.length;i++){
		var navElement = _aMainNav[i];
		if(navElement.href.substr(navElement.href.lastIndexOf("#")+1,navElement.href.length)==sectionName){
			
			return navElement;
		}
	}
	return undefined;
}

function changeNavigation(sectionName) {
	var currentSection = getCurrentSectionNavigationElement();
	removeClass(currentSection,_mainNavCurrent);
	var nextSection = getSectionNavigationElement(sectionName);
	addClass(nextSection,_mainNavCurrent);
}

function initWaypoints()
{
	if(_aMenuItems===undefined) return;
	function addWaypoint(element)
	{
		var id = element.id;
		var waypointDown = new Waypoint({
			element: element,
			handler: function(direction)
			{
				if(direction=="down"){
					changeNavigation(id);
					// scrollAnim(element.getBoundingClientRect().top+_mainMenu.parentNode.scrollTop);
				}
			},
			context: _mainMenu.parentNode,
			offset:"25%"
		});
		var waypointUp = new Waypoint({
			element: element,
			handler: function(direction)
			{
				if(direction=="up"){
					changeNavigation(id);
					// scrollAnim(element.getBoundingClientRect().top+_mainMenu.parentNode.scrollTop);
				}
			},
			context: _mainMenu.parentNode,
			offset:"-25%"
		});
	}
	addWaypoint(_siteHeader);
	for(var i=0;i<_aMenuItems.length;i++)
	{
		addWaypoint(_aMenuItems[i]);
	}
}

function initNavigation()
{
	if(_aMenuItems===undefined) return;
	function activateNav(element){
		element.addEventListener("click",function(e){
			var sectionName = this.href.substr(this.href.lastIndexOf("#")+1,this.href.length);
			scrollAnim(document.getElementById(sectionName).getBoundingClientRect().top+_mainMenu.parentNode.scrollTop);
			changeNavigation(sectionName);
			preventDefault(e);
		});
	}

	for(var i=0;i<_aMainNav.length;i++)
	{
		activateNav(_aMainNav[i]);
	}

	initWaypoints();
}

function updateDetailViewContent(htmlData,callback)
{
	for(var i=0;i<htmlData.length;i++)
    {
    	if(matches(htmlData[i],"#site-container"))
    	{
    		var postContent = htmlData[i].querySelectorAll("#post-container")[0];
    		_detailView.innerHTML = '';
    		_detailView.appendChild(postContent);
    		addDetailViewPaginateEvents();
    		if(callback) callback();
    	}
    }

    document.getElementById("main-menu-link").addEventListener("click",function(e){
    	preventDefault(e);
    	var currentID = this.getAttribute("data-current-id");
		TweenMax.to(_mainMenu.parentNode,0,{scrollTo:{y:document.getElementById(currentID).getBoundingClientRect().top+_mainMenu.parentNode.scrollTop}});
		changeNavigation(currentID);
    	switchView();
    })
}

function switchView()
{
    TweenMax.to("#site-scroller",0.35,{x:_isMainPage?-_viewportWidth+"px":0,ease:Circ.easeOut,onComplete:setMainPageBool});
}

function requestDetailViewContent(url)
{
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	// console.log(url);

	request.onload = function() {
	  if (request.status >= 200 && request.status < 400) {
	    // Success!
	    var htmlData = parseHTML(request.responseText);
	    updateDetailViewContent(htmlData,switchView);
	  } else {
	    // We reached our target server, but it returned an error
	    console.log(error);
	  }
	};

	request.onerror = function() {
	  // There was a connection error of some sort
	};

	request.send();
}

function addDetailViewPaginateEvents()
{
	var nextPage = document.getElementById("nextPage");
	var prevPage = document.getElementById("prevPage");
	var request = new XMLHttpRequest();
	var url;

	if(nextPage!=null) {
		nextPage.addEventListener("click",function(e)
		{
			preventDefault(e)
			url = nextPage.href;
			request.open('GET', url, true);
			request.send();
		});
	}

	if(prevPage!=null) {
		prevPage.addEventListener("click",function(e)
		{
			preventDefault(e)
			url = prevPage.href;
			request.open('GET', url, true);
			request.send();
		});
	}

	request.onload = function(){
		if(request.status>=200 && request.status<400){
			// Success!
		    var htmlData = parseHTML(request.responseText);
		    updateDetailViewContent(htmlData,null);
		}
		else {
			console.log(error);
		}

		request.onerror = function() {
		  // There was a connection error of some sort
		};
	}
}

function initMenuItems()
{
	var links = _mainMenu.querySelectorAll(".btns a");
	for(var i=0;i<links.length;i++)
	{
		links[i].addEventListener("click",function(e){
			requestDetailViewContent(this.href);
			e = e || window.event;
			e.preventDefault();
		});
	}
}

document.addEventListener("DOMContentLoaded", function() {
	setTimeout(function(){

		removeClass(_body,"loading");
		addClass(_body,"loaded");
		addClass(_aMainNav[0],"main-nav-current");

		resizeHandler();
		initNavigation();
		initMenuItems();

		_draggable = Draggable.create("#site-scroller",{
			type:"x",
			throwProps:true,
			bounds:"#site-container",
			zIndexBoost:false,
			zIndex: 1,
			minimumMovement: 10,
			throwResistance:1000,
			onDragStart: function(){
				_dragStart = this.x;
			},
			onDragEnd: function(){
				var dx = _dragStart-this.x;
				var tx = _isMainPage ? 0 : -_viewportWidth;
				var threshhold = 150;
				if(dx>0) // swipe left
				{
					if(dx>=threshhold)
						tx = _isMainPage ? -_viewportWidth : 0;
				}
				else if (dx<0) // swipe right
				{
					if(dx<=-threshhold)
						tx = !_isMainPage ? 0 : -_viewportWidth;
				}
				TweenMax.to("#site-scroller",0.35,{x:tx+"px",ease:Circ.easeOut,onComplete:setMainPageBool});
			},
			dragResistance:0.25,
			edgeResistance:0.8
		})[0];

	},1000);
}, false);