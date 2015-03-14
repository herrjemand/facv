(function($){
	$.fn.salo = function(orguments){
		var options = $.extend({}, orguments);
		var todo = this;

		//Cache. OMG LOL
		var cache = {
			adverts: {},
			categories: {}
		};

		//Models for Adverts, Categories and Modal window.
		var models = {
			advert: function(data){
				return '<div class="large-3 columns item" data-id="' + data.id + '">' +
							'<img src="http://placehold.it/1000x1000&amp;text=Thumbnail">' +
							'<div class="panel">' +
								'<h5><a href="#" class="modal-reveal" data-id="' + data.id + '">' + data.title  + '</a></h5>' +
								'<p>' + data.text + '</p>' +
							'</div>' +
						'</div>';
			}, 
			category: function(id, name){
				return {
					link: '<li class="tab-title" role="presentational" ><a href="#cat-' + id + '" role="tab" tabindex="0"aria-selected="false" controls="cat-' + id + '">' + name + '</a></li>',
					tab: '  <section role="tabpanel" aria-hidden="false" class="content" id="cat-' + id + '"><div class="large-12 columns items"></div></section>'
				}
			},
			modal: function(data){
				return  '<div id="myModal" class="reveal-modal large" data-reveal aria-labelledby="modalTitle" aria-hidden="true" role="dialog">' +
							'<div class="large-4 columns">' +
								'<div class="modal image" style="background-image: url(\'' + 'http://placehold.it/1000x1000&amp;text=Thumbnail' + '\');"> </div>' +
							'</div>' +
							'<div class="large-8 columns">' +
								'<small>Published on ' + data.startDate + ' | Closing on ' + data.endDate + '</small><br/>' +
								'<h1>' + data.title + '</h1><br/>' +
								'<p>' + data.text + '</p>' +
							'</div>' +
							'<a class="close-reveal-modal" aria-label="Close">&#215;</a>' +
						'</div>';
			}
		};

		$.getJSON(options.source).done(function(data){
				
			// console.log(todo);
			todo.each(function(){

				//Iteration through the categories
				for(category of data.categories){

					//Save category to cache
					cache.categories[category.id] = category;

					var catappend = models.category(category.id, category.loc_ru);

					//Create tab
					$(this).append(catappend.tab);

					//Create tab-link
					$(options.links).append(catappend.link);
				};

				//Iteration through the categories
				for(advert of data.adverts){


					// //Checks if advert is not outdated. 
					console.log(Date.parse(advert.endDate) > Date.now());

					if(Date.parse(advert.endDate) > Date()){

						//Save advert to cache
						cache.adverts[advert.id] = advert;

						//Add item
						$('section#cat-' + advert.categoryId + ' > .items', this).append(models.advert(advert));
					}
					
				};

			})

		}).fail(function(e){
			console.log("ERROR: " + e);
		});

		//Event handler for modal windows
		$(document).on('click', '.modal-reveal', function(){

			//Get items id
			var id = $(this).data('id');

			//Retrieves advert from cache
			var info = cache.adverts[id];

			//Generates new modal
			var modal = models.modal(info)

			//Reveals modal
			$(modal).foundation('reveal', 'open');
		})
	}
})(jQuery)