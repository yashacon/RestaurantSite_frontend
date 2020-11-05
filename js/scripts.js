$(document).ready(function() {
	$(document).on("click",function(e){
		var screenWidth=window.innerWidth;
		if(screenWidth<992)
			$('#collapsable-nav').collapse('hide');
	});
});

(function(global){
	var rdm={};
	var homehtml="snippets/Home.html";
	var allCategoriesUrl="http://davids-restaurant.herokuapp.com/categories.json";
	var categoriesTitleHtml="snippets/menu-category-title.html";
	var categoryHtml="snippets/menu-category.html";
	var menuItemsUrl="http://davids-restaurant.herokuapp.com/menu_items.json?category=";
	var menuItemsTitleHtml="snippets/single-title.html";
	var menuItemHtml="snippets/single.html";

	var insertHtml=function(selector,html){
		var targetElem=document.querySelector(selector);
		targetElem.innerHTML=html;
	};
	var showLoading=function(selector){
		var html="<div class='text-center'>";
		html+="<img src='images/ajax-loader.gif' style='width:250px;height:300px;'></div>";
		insertHtml(selector,html);
	};
	var insertProperty=function(string,propName,propValue){
		var propToReplace="{{"+propName+"}}";
		string=string.replace(new RegExp(propToReplace,"g"),propValue);
		return string;
	};

	var insertPrice=function(html,propName,propValue){
		if(!propValue)
			return insertProperty(html,propName,"");

		propValue="Rs."+propValue.toFixed(2);
		html=insertProperty(html,propName,propValue);
		return html;
	};
	var insertPortionName=function(html,propName,propValue){
		if(!propValue)
			return insertProperty(html,propName,"");
		propValue="{"+propValue+"}";
		html=insertProperty(html,propName,propValue);
		return html;
	};

	var switchMenuToActive=function(){
		var classes=document.querySelector("#navHomeButton").className;
		
		classes=classes.replace(new RegExp("active","g"),"");
		document.querySelector("#navHomeButton").className=classes;
		classes=document.querySelector("#navMenuButton").className;
		if (classes.indexOf("active")===-1){
			classes+="active";
			document.querySelector("#navMenuButton").className=classes;
		}
	};
	document.addEventListener("DOMContentLoaded",function(event){
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest(
		allCategoriesUrl,
		function(categories){
			$ajaxUtils.sendGetRequest(
				homehtml,
				function(homeHtml){
					var chosenCategoryShortName=""+chooseRandomCategory(categories).short_name;
					var hometoMain=insertProperty(homeHtml,"short_name",chosenCategoryShortName);
					insertHtml("#main-content",hometoMain);

				},
				false);
		});
	});
	function chooseRandomCategory(categories){
		var randomArrayIndex=Math.floor(Math.random()*categories.length);
		return categories[randomArrayIndex];
	}
	rdm.loadMenuCategories=function(){
		showLoading('#main-content');
		$ajaxUtils.sendGetRequest(
			allCategoriesUrl,
			buildAndShowCategoriesHTML
		);
	};

	rdm.loadMenuItems=function(categoryShort){
		showLoading("#main-content");
		$ajaxUtils.sendGetRequest(
			menuItemsUrl+categoryShort,
			buildAndShowItemsHTML
		);
	};
	function buildAndShowCategoriesHTML(categories){
		$ajaxUtils.sendGetRequest(
			categoriesTitleHtml,
			function(categoriesTitleHtml){
			$ajaxUtils.sendGetRequest(categoryHtml,
				function(categoryHtml){
					switchMenuToActive();
					var categoriesViewHtml=
						buildCategoriesViewHtml(categories,
										categoriesTitleHtml,
										categoryHtml);
					insertHtml("#main-content",categoriesViewHtml);
				},
			false);
			},
		false);
	}

	function buildCategoriesViewHtml(categories,categoriesTitleHtml,categoryHtml){
		var finalHtml=categoriesTitleHtml+"<section class='row'>";
		for(var i=0;i<categories.length;i++){
			var html=categoryHtml;
			var name=""+categories[i].name;
			var short_name=categories[i].short_name;
			html=insertProperty(html,"short_name",short_name);
			html=insertProperty(html,"name",name);
			finalHtml+=html;
		}
		finalHtml+="</section>";
		return finalHtml;
	};

	function buildAndShowItemsHTML(categoryMenuItems){
		$ajaxUtils.sendGetRequest(
		menuItemsTitleHtml,
		function(menuItemsTitleHtml){
			$ajaxUtils.sendGetRequest(menuItemHtml,
				function (menuItemHtml){
					switchMenuToActive();
					var menuItemsViewHtml=
					buildMenuItemsViewHtml(categoryMenuItems,
										menuItemsTitleHtml,
										menuItemHtml);
					insertHtml("#main-content",menuItemsViewHtml);
				},
				false);
		},
		false);
	};

	function buildMenuItemsViewHtml(categoryMenuItems,menuItemsTitleHtml,menuItemHtml){
		menuItemsTitleHtml=insertProperty(menuItemsTitleHtml,
											"name",
											categoryMenuItems.category.name);
		menuItemsTitleHtml=insertProperty(menuItemsTitleHtml,
											"special_instructions",
											categoryMenuItems.category.special_instructions);
		var finalHtml=menuItemsTitleHtml+"<section class='row'>";
		var menuItems=categoryMenuItems.menu_items;
		var catShortName=categoryMenuItems.category.short_name;
		for(var i=0;i<menuItems.length;i++){
			var html=menuItemHtml;
			html=insertProperty(html,"short_name",menuItems[i].short_name);
			html=insertProperty(html,"catShortName",catShortName);
			html=insertPrice(html,"price_small",menuItems[i].price_small);
			html=insertPrice(html,"price_large",menuItems[i].price_large);
			html=insertPortionName(html,"small_portion_name",menuItems[i].small_portion_name);
			html=insertPortionName(html,"large_portion_name",menuItems[i].large_portion_name);
			html=insertProperty(html,"name",menuItems[i].name);
			html=insertProperty(html,"description",menuItems[i].description);
			if(i%2!=0){
				html+="<div class='clearfix></div>"
			}
			finalHtml+=html;
		}
		finalHtml+="</section>";
		return finalHtml;
	};

global.$rdm=rdm;

})(window);