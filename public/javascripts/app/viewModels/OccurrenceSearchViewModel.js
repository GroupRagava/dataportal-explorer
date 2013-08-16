define(["jquery", "knockout", "underscore", "app/models/baseViewModel", "app/map-initialize", "app/models/occurrence", "knockoutKendoUI", "Leaflet", "jqueryUI", "bootstrap"], function($, ko, _, BaseViewModel, map, Occurrence) {
	var OccurrenceSearchViewModel = function() {
		var self = this;

		// Grid table data
		self.gridItems = [];

		// Active distribution
		self.currentActiveDistribution = "none";

		// Help variables
		self.firstScrollRun = true;
		self.detailsFirstScrollRun = true;
		self.helpSearchText = "<p>Escriba un nombre científico y pulse en Agregar filtro.</p><p>Este filtro devolverá cualquier registro que posea un nombre que concuerde con el identificador dado del organismo, sin importar como está clasificado el organismo.</p>";
		self.totalFilters = 0;

		// Total occurrences data
		self.totalOccurrences = 0;
		self.totalGeoOccurrences = 0;

		// Arrays for resume help windows
		self.resumeScientificNames = [];
		self.resumeKingdomNames = [];
		self.resumePhylumNames = [];
		self.resumeClassNames = [];
		self.resumeOrderNames = [];
		self.resumeFamilyNames = [];
		self.resumeGenusNames = [];
		self.resumeSpeciesNames = [];
		self.resumeDataProviders = [];
		self.resumeDataResources = [];
		self.resumeInstitutionCodes = [];
		self.resumeCollectionCodes = [];
		self.resumeCountries = [];
		self.resumeDepartments = [];
		self.isObjectNameHelpSelected = false;
		self.predicateOptions = "[{value: 0, name: 'es'}]";

		// Arrays of selected filters by kind
		self.selectedScientificNames = [];
		self.selectedTaxonNames = [];
		self.selectedCountriesIDs = [];
		self.selectedDepartmentsIDs = [];
		self.selectedLatitudes = [];
		self.selectedLongitudes = [];
		self.selectedAltitudes = [];
		self.selectedDeeps = [];
		self.selectedCoordinate = [];
		self.selectedProviders = [];
		self.selectedResources = [];
		self.selectedDateRanges = [];
		self.selectedYearRanges = [];
		self.selectedYears = [];
		self.selectedMonths = [];
		self.selectedInstitutionCodes = [];
		self.selectedCollectionCodes = [];
		self.selectedCatalogNumbers = [];

		// Array of current occurrences details
		self.occurrencesDetails = [];

		// Filter variables
		self.selectedSubject = 0;
		self.selectedPredicate = "";
		self.objectNameValue = "";
		self.selectedCountry = "";
		self.selectedDepartment = "";
		self.selectedCoordinateState = "";

		BaseViewModel.apply( this, arguments );
	};

	_.extend(OccurrenceSearchViewModel.prototype, BaseViewModel.prototype, {
		initialize: function() {
			this.loadGridData();
			this.loadCellDensityOneDegree();
			//this.loadCellDensityPointOneDegree();
		},
		loadGridData: function() {
			var self = this;
			self.gridOptions = {
				data: false,
				dataSource: {
					type: "jsonp",
					serverPaging: true,
					serverSorting: true,
					serverFiltering: true,
					allowUnsort: true,
					pageSize: 20,
					transport: {
						read: {
							url: "/occurrences/PagedData",
							type: "GET",
							dataType: "jsonp",
							contentType: "application/json; charset=utf-8"
						}
					},
					schema: {
						data: function(data) {
							self.gridItems = ko.observableArray();
							$.each(data.hits.hits, function(i, occurrence) {
								self.gridItems.push(new Occurrence({id: occurrence.fields.id, canonical: occurrence.fields.canonical, data_resource_name: occurrence.fields.data_resource_name, institution_code: occurrence.fields.institution_code, collection_code: occurrence.fields.collection_code, catalogue_number: occurrence.fields.catalogue_number, occurrence_date: occurrence.fields.occurrence_date, latitude: occurrence.fields.location.lat, longitude: occurrence.fields.location.lon, country_name: occurrence.fields.country_name, department_name: occurrence.fields.department_name, basis_of_record_name_spanish: occurrence.fields.basis_of_record_name_spanish}));
							});
							self.totalOccurrences(data.hits.total);
							return self.gridItems();
						},
						total: function(data) {
							return data.hits.total;
						},
						model: {
							fields: {
								id: {type: "string"},
								canonical: {type: "string"},
								data_resource_name: {type: "string"},
								institution_code: {type: "string"},
								collection_code: {type: "string"},
								catalogue_number: {type: "string"},
								basis_of_record_name_spanish: {type: "string"},
								occurrence_date: {type: "date", format: "{0:yyyy-MM-dd}"},
								country_name: {type: "string"},
								department_name: {type: "string"}
							}
						}
					}
				},
				filterable: {
					messages: {
						or: "o",
						and: "y",
						info: "Filtrar con condición:",
						filter: "Aplicar filtro",
						clear: "Quitar filtro"
					},
					operators: {
						string: {
							contains: "Contiene",
							doesnotcontain: "No contiene",
							eq: "Igual a",
							neq: "No igual a",
							startswith: "Comienza con",
							endswith: "Termina con"
						},
						date: {
							eq: "Igual a",
							neq: "No igual a",
							gte: "Después o igual a",
							lte: "Antes o igual a",
							gt: "Después de",
							lt: "Antes de"
						}
					}
				},
				reorderable: true,
				resizable: true,
				sortable: true,
				scrollable: true,
				pageable: {
					pageSize: 20,
					pageSizes: [20, 30, 50, 100],
					buttonCount: 5,
					input: true,
					messages: {
						display: "{0}-{1} de {2} registros biológicos",
						empty: "No hay registros biológicos",
						page: "Página",
						of: "de {0}",
						itemsPerPage: "registros biológicos por página",
						first: "Primera página",
						last: "Última página",
						next: "Siguiente página",
						previous: "Anterior página"
					}
				},
				groupable: {
					messages: {
						empty: "Arrastre un encabezado de calumna a esta zona para agrupar por dicha columna."
					}
				},
				columns: [
					{ field: "id", title: "ID", width: "5%", filterable: {operators: {string: {eq: "Igual a", neq: "No igual a"}}} },
					{ field: "canonical", title: "Nombre científico", width: "13%",  template: '<a target="_blank" href="http://data.sibcolombia.net/occurrences/#=id#">#=canonical#</a>' },
					{ field: "data_resource_name", title: "Recurso de datos", width: "13%" },
					{ field: "institution_code", title: "Cód. institución", width: "11%" },
					{ field: "collection_code", title: "Cód. colección", width: "10%" },
					{ field: "catalogue_number", title: "Núm. catálogo", width: "10%" },
					{ field: "basis_of_record_name_spanish", title: "Base registro", width: "10%", filterable: {ui: basisOfRecordFilter} },
					{ field: "occurrence_date", title: "Fecha", width: "8%", template: '#= kendo.toString(occurrence_date, "yyyy-MM-dd") #', filterable: {ui: dateTimeEditor} },
					{ field: "location()", title: "Coordenadas", width: "8%", sortable: false },
					{ field: "country_name", title: "País", width: "6%", sortable: true },
					{ field: "department_name", title: "Dept.", width: "8%", sortable: true }
				]
			};

			function dateTimeEditor(element) {
				element.kendoDatePicker({
					format:"yyyy-MM-dd",
					min: new Date(1000, 0, 1),
					max: new Date(10000, 0, 1)
				});
			}

			function basisOfRecordFilter(element) {
				var data = [
					{ text: "Desconocido", value: "desconocido" },
					{ text: "Espécimen", value: "espécimen" },
					{ text: "Espécimen Fosilizado", value: "espécimen fosilizado" },
					{ text: "Espécimen Preservado", value: "espécimen preservado" },
					{ text: "Espécimen Vivo", value: "espécimen vivo" },
					{ text: "Fosil", value: "fosil" },
					{ text: "Germoplasmo", value: "germoplasmo" },
					{ text: "Grabación de Sonido", value: "grabación de sonido" },
					{ text: "Imagen en Movimiento", value: "imagen en movimiento" },
					{ text: "Imagen Fija", value: "imagen fija" },
					{ text: "Lista legislativa", value: "lista legislativa" },
					{ text: "Lista regional", value: "lista regional" },
					{ text: "Literatura", value: "literatura" },
					{ text: "Nomenclaturador", value: "nomenclaturador" },
					{ text: "Observación", value: "observación" },
					{ text: "Observación con Máquina", value: "observación con máquina" },
					{ text: "Observación Humana", value: "observación humana" },
					{ text: "Otro Espécimen", value: "otro espécimen" },
					{ text: "Taxonomía", value: "taxonomía" },
					{ text: "Viviendo", value: "viviendo" }
				];
				element.kendoDropDownList({
					dataTextField: "text",
					dataValueField: "value",
					dataSource: data,
					optionLabel: "-- Seleccione --"
				});
			}
		},
		loadCellDensityOneDegree: function() {
			var self = this;
			// Initialize default cell density distribution (one degree)
			var densityCellsOneDegree = new L.FeatureGroup();
			$.getJSON("/distribution/onedegree/list", function(allData) {
				$.each(allData.hits.hits, function(i, cell) {
					var bounds = [[cell.fields.location_cell.lat, cell.fields.location_cell.lon], [cell.fields.location_cell.lat+1, cell.fields.location_cell.lon+1]];
					var color = "#ff7800";
					if (cell.fields.count > 0 && cell.fields.count < 10) {
						color = "#FFFF00";
					} else if(cell.fields.count > 9 && cell.fields.count < 100) {
						color = "#FFCC00";
					} else if(cell.fields.count > 99 && cell.fields.count < 1000) {
						color = "#FF9900";
					} else if(cell.fields.count > 999 && cell.fields.count < 10000) {
						color = "#FF6600";
					} else if(cell.fields.count > 9999 && cell.fields.count < 100000) {
						color = "#FF3300";
					} else if(cell.fields.count > 99999) {
						color = "#CC0000";
					}
					var densityCell = new L.rectangle(bounds, {color: color, weight: 1, fill: true, fillOpacity: 0.5});
					densityCell.on('mouseover', function (a) {
						a.target.bindPopup("<strong>No. registros: </strong>" + cell.fields.count + "</br></br><strong>Ubicación:</strong></br>[" + cell.fields.location_cell.lat + ", " + cell.fields.location_cell.lon + "] [" + (cell.fields.location_cell.lat+1) + ", " + (cell.fields.location_cell.lon+1) + "]").openPopup();
					});
					densityCellsOneDegree.addLayer(densityCell);
				});
				self.totalGeoOccurrences(allData.facets.stats.total);
				map.addLayer(densityCellsOneDegree);
				$("#oneDegreeButton").button('toggle');
				self.currentActiveDistribution("oneDegree");
			});
		},
		loadCellDensityPointOneDegree: function() {
			var self = this;
			// Initialize default cell density distribution (one degree)
			var densityCellsPointOneDegree = new L.FeatureGroup();
			$.getJSON("/distribution/centidegree/list", function(allData) {
				$.each(allData.hits.hits, function(i, cell) {
					var bounds = [[cell.fields.location_centi_cell.lat, cell.fields.location_centi_cell.lon], [cell.fields.location_centi_cell.lat+0.1, cell.fields.location_centi_cell.lon+0.1]];
					var color = "#ff7800";
					if (cell.fields.count > 0 && cell.fields.count < 10) {
						color = "#FFFF00";
					} else if(cell.fields.count > 9 && cell.fields.count < 100) {
						color = "#FFCC00";
					} else if(cell.fields.count > 99 && cell.fields.count < 1000) {
						color = "#FF9900";
					} else if(cell.fields.count > 999 && cell.fields.count < 10000) {
						color = "#FF6600";
					} else if(cell.fields.count > 9999 && cell.fields.count < 100000) {
						color = "#FF3300";
					} else if(cell.fields.count > 99999) {
						color = "#CC0000";
					}
					var densityCell = new L.rectangle(bounds, {color: color, weight: 1, fill: true, fillOpacity: 0.5});
					densityCell.on('mouseover', function (a) {
						a.target.bindPopup("<strong>No. registros: </strong>" + cell.fields.count + "</br></br><strong>Ubicación:</strong></br>[" + cell.fields.location_centi_cell.lat + ", " + cell.fields.location_centi_cell.lon + "] [" + (((cell.fields.location_centi_cell.lat*10)+1)/10) + ", " + (((cell.fields.location_centi_cell.lon*10)+1)/10) + "]").openPopup();
					});
					densityCellsPointOneDegree.addLayer(densityCell);
				});
				self.totalGeoOccurrences(allData.facets.stats.total);
				//$("#oneDegreeButton").button('toggle');
				map.addLayer(densityCellsPointOneDegree);
			});
		},
		disableOccurrencesDetail: function() {
			if(!$("#occurrenceDetail").is(':hidden')) {
				$("#occurrenceDetail").animate({width: 'toggle'});
			}
		},
		disableFilterHelp: function() {
			if(this.isObjectNameHelpSelected() === true || !$("#filtersContainerHelp").is(':hidden')) {
				this.isObjectNameHelpSelected = ko.observable(false);
				$("#filtersContainerHelp").animate({width: 'toggle'});
			}
		},
		changeFilterHelp: function() {
			var self = this;
			$("#filtersContainerHelp").css({display: 'none'});
			self.isObjectNameHelpSelected = ko.observable(false);
			// Default filters predicate
			self.predicateOptions([{value: 0, name: 'es'}]);
			if(self.selectedSubject() === 0) {
				// Get Scientific Name resume data
				self.getScientificNamesData();
			} else if(self.selectedSubject() == 100) {
				// Get kingdom resume data
				self.getKingdomNamesData();
			} else if(self.selectedSubject() == 101) {
				// Get phylum resume data
				self.getPhylumNamesData();
			} else if(self.selectedSubject() == 102) {
				// Get class resume data
				self.getClassNamesData();
			} else if(self.selectedSubject() == 103) {
				// Get order resume data
				self.getOrderNamesData();
			} else if(self.selectedSubject() == 104) {
				// Get family resume data
				self.getFamilyNamesData();
			} else if(self.selectedSubject() == 105) {
				// Get genus resume data
				self.getGenusNamesData();
			} else if(self.selectedSubject() == 106) {
				// Get species resume data
				self.getSpeciesNamesData();
			} else if(self.selectedSubject() == 25) {
				// Get data providers resume data
				self.getDataProvidersData();
			} else if(self.selectedSubject() == 24) {
				// Get data resources resume data
				self.getDataResourcesData();
			} else if(self.selectedSubject() == 12) {
				// Get institution codes resume data
				self.getInstitutionCodesData();
			} else if(self.selectedSubject() == 13) {
				// Get collection codes resume data
				self.getCollectionCodesData();
			} else if(self.selectedSubject() == 1 || self.selectedSubject() == 2 || self.selectedSubject() == 34 || self.selectedSubject() == 35) {
				self.predicateOptions([{value: 0, name: 'es'},{value: 1, name: 'mayor que'},{value: 2, name: 'menor que'}]);
			} else if(self.selectedSubject() == 5) {
				// Get countries resume data
				self.getCountriesData();
				self.isObjectNameHelpSelected = ko.observable(true);
				$("#filtersContainerHelp").animate({width: 'toggle'}, 500, "swing", function() {
					if(self.firstScrollRun) {
						$("#contentFiltersContainerHelp").mCustomScrollbar({
							theme:"dark"
						});
						self.firstScrollRun = false;
					} else {
						$("#contentFiltersContainerHelp").mCustomScrollbar("update");
					}
				});
			} else if(self.selectedSubject() == 38) {
				// Get countries resume data
				self.getDepartmentsData();
				self.isObjectNameHelpSelected = ko.observable(true);
				$("#filtersContainerHelp").animate({width: 'toggle'}, 500, "swing", function() {
					if(self.firstScrollRun) {
						$("#contentFiltersContainerHelp").mCustomScrollbar({
							theme:"dark"
						});
						self.firstScrollRun = false;
					} else {
						$("#contentFiltersContainerHelp").mCustomScrollbar("update");
					}
				});
			}
			self.getHelpSearchText();
		},
		getHelpSearchText: function() {
			var self = this;
			$.getJSON("/occurrences/searchhelptext/name/"+self.selectedSubject(), function(allData) {
				self.helpSearchText(allData.text);
			});
		},
		enableFilterHelp: function() {
			var self = this;
			if((self.isObjectNameHelpSelected() === false || $("#filtersContainerHelp").is(':hidden')) && self.selectedSubject() != 1 && self.selectedSubject() != 2 && self.selectedSubject() != 34 && self.selectedSubject() != 35 && self.selectedSubject() != 21 && self.selectedSubject() != 14) {
				self.isObjectNameHelpSelected = ko.observable(true);
				$("#filtersContainerHelp").animate({width: 'toggle'}, 500, "swing", function() {
					if(self.firstScrollRun) {
						$("#contentFiltersContainerHelp").mCustomScrollbar({
							theme:"dark"
						});
						self.firstScrollRun = false;
					} else {
						$("#contentFiltersContainerHelp").mCustomScrollbar("update");
					}
				});
			}
		},
		addFilterItem: function() {
			var self = this;
			if(self.selectedSubject() === 0) {
				// Adding scientific name filter
				self.addScientificName();
			} else if(self.selectedSubject() == 100) {
				self.addTaxonName(self.selectedSubject(), "Reino");
			} else if(self.selectedSubject() == 101) {
				self.addTaxonName(self.selectedSubject(), "Filo");
			} else if(self.selectedSubject() == 102) {
				self.addTaxonName(self.selectedSubject(), "Clase");
			} else if(self.selectedSubject() == 103) {
				self.addTaxonName(self.selectedSubject(), "Orden");
			} else if(self.selectedSubject() == 104) {
				self.addTaxonName(self.selectedSubject(), "Familia");
			} else if(self.selectedSubject() == 105) {
				self.addTaxonName(self.selectedSubject(), "Género");
			} else if(self.selectedSubject() == 106) {
				self.addTaxonName(self.selectedSubject(), "Especie");
			} else if(self.selectedSubject() == 5) {
				// Adding cuntry filter
				self.addCountryID();
			} else if(self.selectedSubject() == 38) {
				// Adding department filter
				self.addDepartmentID();
			} else if(self.selectedSubject() == 1) {
				// Adding latitude filter
				self.addLatitudeNumber();
			} else if(self.selectedSubject() == 2) {
				// Adding longitude filter
				self.addLongitudeNumber();
			} else if(self.selectedSubject() == 34) {
				// Adding altitude filter
				self.addAltitudeNumber();
			} else if(self.selectedSubject() == 35) {
				// Adding deep filter
				self.addDeepNumber();
			} else if(self.selectedSubject() == 28) {
				// Adding coordinate state filter
				self.addCoordinateState();
			} else if(self.selectedSubject() == 25) {
				// Adding data provider filter
				self.addDataProviderName();
			} else if(self.selectedSubject() == 24) {
				// Adding data resource filter
				self.addDataResourceName();
			}
		},
		startSearch: function() {
			var response = {};
			var self = this;
			if(self.selectedScientificNames().length !== 0);
				response['scientificNames'] = self.selectedScientificNames();
			if(self.selectedTaxonNames().length !== 0)
				response['taxons'] = self.selectedTaxonNames();
			if(self.selectedCountriesIDs().length !== 0)
				response['countries'] = self.selectedCountriesIDs();
			if(self.selectedDepartmentsIDs().length !== 0)
				response['departments'] = self.selectedDepartmentsIDs();
			if(self.selectedLatitudes().length !== 0)
				response['latitudes'] = self.selectedLatitudes();
			if(self.selectedLongitudes().length !== 0)
				response['longitudes'] = self.selectedLongitudes();
			if(self.selectedAltitudes().length !== 0)
				response['altitudes'] = self.selectedAltitudes();
			if(self.selectedDeeps().length !== 0)
				response['deeps'] = self.selectedDeeps();
			if(self.selectedCoordinate().length !== 0)
				response['coordinates'] = self.selectedCoordinate();
			if(self.selectedProviders().length !== 0)
				response['providers'] = self.selectedProviders();
			if(self.selectedResources().length !== 0)
				response['resources'] = self.selectedResources();
			var data = ko.toJSON(response);
			$.ajax({
				contentType: 'application/json',
				type: 'POST',
				url: '/occurrences/search',
				data: data,
				beforeSend: function() {
					self.disableFilterHelp();
					$(".tab-content").addClass("hide-element");
					$("#map-filter-area").addClass("loading");
				},
				complete: function() {
					$("#map-filter-area").removeClass("loading");
					$(".tab-content").removeClass("hide-element");
				},
				success: function(returnedData) {
					//markers.clearLayers();
					var totalGeoOccurrences = 0;
					$.each(returnedData, function(i, geooccurrence) {
						//var marker = new L.Marker(new L.LatLng(geooccurrence.latitude, geooccurrence.longitude), { title: geooccurrence.canonical})
						//marker.bindPopup(geooccurrence.canonical + ' (' + geooccurrence.num_occurrences + ')')
						//markers.addLayer(marker)
						//totalGeoOccurrences = totalGeoOccurrences + geooccurrence.num_occurrences
					});
					markers.on('click', function (a) {
						if(a.layer._preSpiderfyLatlng) {
							var latitude = a.layer._preSpiderfyLatlng.lat;
							var longitude = a.layer._preSpiderfyLatlng.lng;
						} else {
							var latitude = a.layer.getLatLng().lat;
							var longitude = a.layer.getLatLng().lng;
						}
						$.getJSON("/occurrences/details/search?canonical="+a.layer.options.title+"&latitude="+latitude+"&longitude="+longitude, function(allData) {
							var mappedOccurrences = $.map(allData, function(item) {
								return new Occurrence(item);
							});
							self.occurrencesDetails(mappedOccurrences);
							self.disableFilterHelp();
							if($("#occurrenceDetail").is(':hidden')) {
								$("#occurrenceDetail").animate({width: 'toggle'}, 500, "swing", function() {
									if(self.detailsFirstScrollRun) {
										$("#occurrenceDetailContainer").mCustomScrollbar({
											theme:"dark"
										});
										self.detailsFirstScrollRun = false;
									} else {
										$("#occurrenceDetailContainer").mCustomScrollbar("update");
									}
								});
							} else {
								$("#occurrenceDetailContainer").mCustomScrollbar("update");
							}
						});
					});
					self.totalGeoOccurrences(totalGeoOccurrences);
				},
				dataType: 'jsonp'
			});
		},
		toggleDistribution: function(data, event) {
			console.log(data);
			console.log(event);
		},
		initializeFloatingWindowsAndResize: function() {
			// Enable floating windows for search floating window
			$(function() {
				$("#filterZone").draggable({handle: "#top-filterZone"});
			});

			// Enable min/max button for search floating window
			$(".minimize-maximize-button").click(function() {
				if($("#filtersContainer").is(':visible')) {
					$("#filterZone").removeClass("open");
				} else {
					$("#filterZone").addClass("open");
				}
				$("#filtersContainer").slideToggle();
				$("#filtersContainerHelp").css({display: 'none'});
			});

			// Set map initial height
			$("#mapa").height($(window).height()-$("header").height());

			// Change map and table grid height when windows resize
			$(window).resize(function(){
				$("#mapa").height($(window).height()-$("header").height());
				$("#reportGrid").height($(window).height()-$("header").height()-$("#actual-search-stats-data").height()-60);
				$("#reportGrid .k-grid-content").height($(window).height()-$("header").height()-$("#actual-search-stats-data").height()-60-91);
			});
		}
	});

	return OccurrenceSearchViewModel;
});