/*exported Ractive*/
var Ractive = require('ractive');
/* jshint ignore:start */
RactiveF = {
	components: {},
	templates: {},
	widgets: [],
	initInstance: function (container) {

		// Have we mixed in extensions to all instances yet?
		if (!Ractive.prototype.findAllChildComponents) {
			_.mixin(Ractive.prototype, RactiveF.mixins);
		}

		var instance = new Ractive({
			el: container,
			template: Ractive.parse(container.innerHTML),
			components: RactiveF.components,
			onrender: function () {
				this.el.classList.remove('hide');
				this.el.classList.add('initialize');
			}
		});

		instance.on('*.*', RactiveF.genericEventHandler);

		instance.set('dataModel', '{{dataModel}}');

		return instance;
	},

	genericEventHandler: function (origin) {

		// list of events below copied from Ractive source code v0.7.1
		// Filtering out ractive lifecycle events to not pollute log output.
		var reservedEventNames =
				/^(?:change|complete|reset|teardown|update|construct|config|init|render|unrender|detach|insert)$/;

		if (!reservedEventNames.test(this.event.name)) {
			console.log('Event', this.event.name);
			console.log('Event handler arguments', origin);

			var eventName = 'events.' + origin.get('uid');
			if (!this.get(eventName)) {
				this.set(eventName, []);
			}
			this.push(eventName, this.event.name);
		}

	},

	mixins: {
		/*
		 * When working with nested components we only want to find child
		 * components, not all decendants.
		 * @param name
		 */
		findAllChildComponents: function (name) {
			return _.filter(this.findAllComponents(name), function (component) {
				return this._guid === component.parent._guid;
			}.bind(this));
		},

		/**
		 * If we have a "datamodel" property, that should override any other data.
		 * This is now a "data-driven" component.
		 * isDataModel is a flag for hbs logic, on whether to use datamodel data or call {{yield}}.
		 * @see http://docs.ractivejs.org/latest/ractive-reset
		 *
		 * TODO Understand the difference between rendering components off the page vs nested inside others.
		 * onconstruct has empty opts for the latter.
		 */
		onconstruct: function (opts) {
			if (opts.data && opts.data.datamodel) {
				var datamodel = _.cloneDeep(opts.data.datamodel);
				datamodel.isDataModel = true;
				opts.data = _.assign(opts.data, datamodel);
				delete opts.data.datamodel;
			}
		},

		/**
		 * For any data-driven component - if something sets 'datamodel', lift that into root scope.
		 */
		onrender: function () {

			// Wait for parent component to set "datamodel" and then map that back into data again.
			this.observe('datamodel', function (newDataModel) {
				if (newDataModel) {
					// Lift datamodel data into root data scope.
					this.set(newDataModel);
				}
			});

		}
	}

};

RactiveF.templates['ux-accordionitem'] = {"v":3,"t":[{"t":7,"e":"li","a":{"id":[{"t":2,"r":"guid"}],"class":"accordion-navigation"},"f":[{"t":4,"f":[{"t":7,"e":"ux-anchor","f":[{"t":2,"r":"title"}]}," ",{"t":7,"e":"ux-content","f":[{"t":3,"r":"content"}]}],"n":50,"r":"isDataModel"},{"t":4,"n":51,"f":[{"t":16}],"r":"isDataModel"}]}]};
RactiveF.templates['ux-anchor'] = {"v":3,"t":[{"t":7,"e":"a","a":{"id":[{"t":2,"r":"guid"}],"href":[{"t":2,"r":"href"}]},"m":[{"t":4,"f":["target=\"",{"t":2,"r":"target"},"\""],"n":50,"r":"target"}],"v":{"click":"anchorClicked"},"f":[{"t":4,"f":[{"t":3,"r":"content"}],"n":50,"r":"isDataModel"},{"t":4,"n":51,"f":[{"t":16}],"r":"isDataModel"}]}]};
RactiveF.templates['ux-button'] = {"v":3,"t":[{"t":7,"e":"a","a":{"class":["button ",{"t":2,"r":"class"}]},"m":[{"t":4,"f":["href=\"",{"t":2,"r":"href"},"\""],"r":"href"},{"t":4,"f":[" role=\"",{"t":2,"r":"role"},"\""],"r":"role"},{"t":4,"f":[" aria-label=\"",{"t":2,"r":"ariaLabel"},"\""],"r":"ariaLabel"},{"t":4,"f":[" tabindex=\"",{"t":2,"r":"tabindex"},"\""],"r":"tabindex"}],"v":{"click":{"m":"clickHandler","a":{"r":[],"s":"[]"}}},"f":[{"t":4,"f":[{"t":2,"r":"text"}],"n":50,"r":"text"},{"t":4,"n":51,"f":[{"t":8,"r":"content"}],"r":"text"}]}]};
RactiveF.templates['ux-col'] = {"v":3,"t":[{"t":7,"e":"div","a":{"class":[{"t":2,"r":"class"}," columns"]},"f":[{"t":16}]}]};
RactiveF.templates['ux-content'] = {"v":3,"t":[{"t":7,"e":"div","a":{"id":[{"t":2,"r":"guid"}],"class":["content ",{"t":4,"f":["active"],"n":50,"r":"active"}]},"f":[{"t":16}]}]};
RactiveF.templates['ux-accordion'] = {"v":3,"t":[{"t":7,"e":"ul","a":{"id":[{"t":2,"r":"guid"}],"class":"accordion","data-accordion":0},"f":[{"t":4,"f":[{"t":4,"f":[{"t":7,"e":"ux-accordionitem","a":{"datamodel":[{"t":2,"r":"."}]}}],"r":"items"}],"n":50,"r":"isDataModel"},{"t":4,"n":51,"f":[{"t":8,"r":"content"}],"r":"isDataModel"}]}]};
RactiveF.templates['ux-header'] = {"v":3,"t":[{"t":4,"f":[{"t":7,"e":"h1","m":[{"t":4,"f":["id=\"",{"t":2,"r":"id"},"\""],"r":"id"},{"t":4,"f":["class=\"",{"t":2,"r":"class"},"\""],"r":"class"}],"f":[{"t":16}]}],"n":50,"x":{"r":["level"],"s":"_0==1"}}," ",{"t":4,"f":[{"t":7,"e":"h2","m":[{"t":4,"f":["id=\"",{"t":2,"r":"id"},"\""],"r":"id"},{"t":4,"f":["class=\"",{"t":2,"r":"class"},"\""],"r":"class"}],"f":[{"t":16}]}],"n":50,"x":{"r":["level"],"s":"_0==2"}}," ",{"t":4,"f":[{"t":7,"e":"h3","m":[{"t":4,"f":["id=\"",{"t":2,"r":"id"},"\""],"r":"id"},{"t":4,"f":["class=\"",{"t":2,"r":"class"},"\""],"r":"class"}],"f":[{"t":16}]}],"n":50,"x":{"r":["level"],"s":"_0==3"}}," ",{"t":4,"f":[{"t":7,"e":"h4","m":[{"t":4,"f":["id=\"",{"t":2,"r":"id"},"\""],"r":"id"},{"t":4,"f":["class=\"",{"t":2,"r":"class"},"\""],"r":"class"}],"f":[{"t":16}]}],"n":50,"x":{"r":["level"],"s":"_0==4"}}," ",{"t":4,"f":[{"t":7,"e":"h5","m":[{"t":4,"f":["id=\"",{"t":2,"r":"id"},"\""],"r":"id"},{"t":4,"f":["class=\"",{"t":2,"r":"class"},"\""],"r":"class"}],"f":[{"t":16}]}],"n":50,"x":{"r":["level"],"s":"_0==5"}}," ",{"t":4,"f":[{"t":7,"e":"h6","m":[{"t":4,"f":["id=\"",{"t":2,"r":"id"},"\""],"r":"id"},{"t":4,"f":["class=\"",{"t":2,"r":"class"},"\""],"r":"class"}],"f":[{"t":16}]}],"n":50,"x":{"r":["level"],"s":"_0==6"}}]};
RactiveF.templates['ux-iconbar'] = {"v":3,"t":[{"t":7,"e":"div","a":{"class":["icon-bar ",{"t":2,"r":"upNumClass"}," ",{"t":2,"r":"class"}],"role":"navigation"},"f":[{"t":4,"f":[{"t":4,"f":[{"t":7,"e":"ux-iconbaritem","a":{"datamodel":[{"t":2,"x":{"r":["getItemData","."],"s":"_0(_1)"}}]}}],"r":"items"}],"n":50,"r":"isDataModel"},{"t":4,"n":51,"f":[{"t":8,"r":"content"}],"r":"isDataModel"}]}]};
RactiveF.templates['ux-iconbaritem'] = {"v":3,"t":[{"t":7,"e":"a","a":{"href":[{"t":2,"r":"href"}],"class":["item ",{"t":2,"r":"class"}],"tabindex":"0","role":"button"},"m":[{"t":4,"f":["aria-labelledby=\"",{"t":2,"r":"guid"},"\""],"n":50,"x":{"r":["labels"],"s":"_0!==false"}},{"t":4,"f":["aria-label=",{"t":2,"r":"arialabel"}],"n":50,"r":"arialabel"}],"f":[{"t":7,"e":"img","a":{"src":[{"t":2,"r":"src"}]}}," ",{"t":4,"f":[{"t":7,"e":"label","a":{"id":[{"t":2,"r":"guid"}]},"f":[{"t":4,"f":[{"t":2,"r":"label"}],"n":50,"r":"isDataModel"},{"t":4,"n":51,"f":[{"t":16}],"r":"isDataModel"}]}],"n":50,"x":{"r":["labels"],"s":"_0!==false"}}]}]};
RactiveF.templates['ux-li'] = {"v":3,"t":[{"t":7,"e":"li","a":{"class":[{"t":2,"r":"class"}]},"m":[{"t":4,"f":["role=\"",{"t":2,"r":"role"},"\""],"r":"role"}],"f":[{"t":8,"r":"content"}]}]};
RactiveF.templates['ux-panel'] = {"v":3,"t":[{"t":7,"e":"div","a":{"class":["panel ",{"t":2,"r":"class"}]},"f":[{"t":4,"f":[{"t":2,"r":"text"}],"n":50,"r":"text"},{"t":4,"n":51,"f":[{"t":16}],"r":"text"}]}]};
RactiveF.templates['ux-pricingtable'] = {"v":3,"t":[{"t":7,"e":"ul","a":{"class":"pricing-table"},"f":[{"t":8,"r":"content"}," ",{"t":7,"e":"li","a":{"class":"cta-button"},"f":[{"t":4,"f":[{"t":7,"e":"a","a":{"class":"button disabled","href":"#"},"v":{"click":"buyNow"},"f":["Coming Soon"]}],"n":50,"x":{"r":["status"],"s":"_0==\"comingsoon\""}}," ",{"t":4,"f":[{"t":7,"e":"a","a":{"class":"button","href":[{"t":2,"r":"href"}]},"v":{"click":"buyNow"},"f":["Buy Now"]}],"n":50,"x":{"r":["status"],"s":"!_0"}}]}]}]};
RactiveF.templates['ux-row'] = {"v":3,"t":[{"t":7,"e":"div","a":{"class":["row ",{"t":2,"r":"class"}]},"f":[{"t":16}]}]};
RactiveF.templates['ux-sidenav'] = {"v":3,"t":[{"t":7,"e":"ul","a":{"class":"side-nav","role":"navigation"},"m":[{"t":4,"f":["title=\"",{"t":2,"r":"title"},"\""],"r":"title"}],"f":[{"t":4,"f":[{"t":4,"f":[{"t":4,"f":[{"t":7,"e":"ux-li","a":{"class":"heading"},"f":[{"t":2,"r":".label"}]}],"r":"isHeading"}," ",{"t":4,"f":[{"t":7,"e":"ux-li","a":{"class":"divider"}}],"r":"isDivider"}," ",{"t":4,"f":[{"t":7,"e":"ux-li","a":{"class":[{"t":4,"f":["active"],"r":"active"}],"role":"menuitem"},"f":[{"t":7,"e":"a","a":{"href":[{"t":2,"r":".href"}]},"f":[{"t":2,"r":".label"}]}]}],"r":"href"}],"n":52,"r":"items"}],"n":50,"r":"isDataModel"},{"t":4,"n":51,"f":[{"t":16}],"r":"isDataModel"}]}]};
RactiveF.templates['ux-tabarea'] = {"v":3,"t":[{"t":7,"e":"div","a":{"class":"tabs-area"},"f":[{"t":4,"f":[{"t":7,"e":"ux-tablinks","f":[{"t":4,"f":[{"t":7,"e":"ux-tablink","a":{"id":[{"t":2,"r":".id"}],"active":[{"t":2,"r":".active"}]},"f":[{"t":2,"r":".title"}]}],"r":"items"}]}," ",{"t":7,"e":"ux-tabpanes","f":[{"t":4,"f":[{"t":7,"e":"ux-tabpane","a":{"datamodel":[{"t":2,"x":{"r":["tabPaneDataModel","."],"s":"_0(_1)"}}]}}],"r":"items"}]}],"n":50,"r":"isDataModel"},{"t":4,"n":51,"f":[{"t":8,"r":"content"}],"r":"isDataModel"}]}]};
RactiveF.templates['ux-tablink'] = {"v":3,"t":[{"t":7,"e":"li","a":{"class":["tab-title ",{"t":2,"r":"class"}," ",{"t":4,"f":["active"],"n":50,"r":"active"}],"role":"presentational"},"f":[{"t":7,"e":"a","a":{"href":"#"},"v":{"click":"changeTab"},"f":[{"t":16}]}]}]};
RactiveF.templates['ux-tablinks'] = {"v":3,"t":[{"t":7,"e":"ul","a":{"class":["tabs ",{"t":4,"f":["vertical"],"r":"vertical"}],"role":"tablist"},"f":[{"t":8,"r":"content"}]}]};
RactiveF.templates['ux-tabpane'] = {"v":3,"t":[{"t":7,"e":"section","a":{"class":["content ",{"t":2,"r":"class"}," ",{"t":4,"f":["hide"],"n":50,"x":{"r":["active"],"s":"!_0"}}],"role":"tabpanel","aria-hidden":[{"t":4,"f":["false"],"n":50,"r":"active"},{"t":4,"n":51,"f":["true"],"r":"active"}]},"f":[{"t":4,"f":[{"t":8,"r":"dynamicContent"}],"n":50,"r":"isDataModel"},{"t":4,"n":51,"f":[{"t":16}],"r":"isDataModel"}]}]};
RactiveF.templates['ux-tabpanes'] = {"v":3,"t":[{"t":7,"e":"div","a":{"class":"tabs-content"},"f":[{"t":8,"r":"content"}]}]};
RactiveF.components['ux-accordionitem'] = Ractive.extend({

	template: RactiveF.templates['ux-accordionitem'],

	computed: {
		guid: function () {
			return this._guid;
		}
	},

	oninit: function () {

		var anchorComponent = this.findComponent('ux-anchor');
		var contentComponent = this.findComponent('ux-content');

		// Link the anchor to the content by the content's id for nice html.
		anchorComponent.set({
			href: '#' + contentComponent._guid
		});

		contentComponent.set({
			active: this.get('active') || false
		});

		// Listen for click event on accordion title element, and then fire a semantic event for accordion.
		anchorComponent.on('anchorClicked', function (e) {
			this.fire('changeAccordion', this);
			return false;
		}.bind(this));

		this.set({
			contentComponent: contentComponent,
			initialized: true
		});

	},

	onchange: function () {

		if (!this.get('initialized')) {
			// Not ready yet for onchange.
			return;
		}

		this.get('contentComponent').set({
			active: this.get('active')
		});

	}

});

RactiveF.components['ux-anchor'] = Ractive.extend({
	template: RactiveF.templates['ux-anchor'],
	computed: {
		guid: function () {
			return this._guid;
		}
	}
});

RactiveF.components['ux-button'] = Ractive.extend({
	template: RactiveF.templates['ux-button'],
	clickHandler: function () {

		// if a click event is specified propagate the click event

		console.log('Button event');

		if (this.get('onclick')) {
			console.log('Firing event');
			this.fire(this.get('onclick'), this);
		}

		// prevent bubbling
		return true;
	}
});

RactiveF.components['ux-col'] = Ractive.extend({
	template: RactiveF.templates['ux-col']
});

RactiveF.components['ux-content'] = Ractive.extend({
	template: RactiveF.templates['ux-content'],
	computed: {
		guid: function () {
			return this._guid;
		}
	}
});

RactiveF.components['ux-accordion'] = Ractive.extend({

	template: RactiveF.templates['ux-accordion'],

	computed: {
		guid: function () {
			return this._guid;
		}
	},

	oninit: function () {

		this.set('componentItems', this.findAllChildComponents('ux-accordionitem'));

		this.on('*.changeAccordion', function (srcItem) {

			_.each(this.get('componentItems'), function (component) {

				// Is this the item the user clicked on?
				if (component._guid === srcItem._guid) {

					// Support open and close behaviours with repeated clicking by User.
					component.toggle('active');

				} else {

					// Not where the User clicked, so close it (if open).
					component.set('active', false);

				}

			});

			// Stop bubbling.
			return false;

		});

	}

});

RactiveF.components['ux-header'] = Ractive.extend({
	template: RactiveF.templates['ux-header']
});

RactiveF.components['ux-iconbar'] = Ractive.extend({

	getUpNumClass: function (num) {

		var supportedWords = [
			'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'
		];

		if (!supportedWords[num]) {
			//console.error('ux-iconbar#numberToWord: num NOT supported: ' + num);
			return '';
		}

		return supportedWords[num] + '-up';

	},

	template: RactiveF.templates['ux-iconbar'],

	data: {

		getItemData: function (itemData) {
			// Nothing needs to be mapped, but we don't want parent data leaking down.
			return itemData;
		}

	},

	computed: {

		/**
		* TODO Move to generic helpers location?
		* @returns {string} The number of child items as a css class, e.g. "one-up", "three-up", etc.
		*/
		upNumClass: function () {

			var items = this.get('items');

			if (!items) {
				return '';
			}

			// Data-driven component has items data.
			return this.getUpNumClass(items.length);

		}

	},

	oninit: function () {

		// Only needed for markup mode.
		if (!this.get('isDataModel')) {
			var itemComponents = this.findAllChildComponents('ux-iconbaritem');
			var cssClass = this.get('class') || '';
			this.set('class', cssClass + ' ' + this.getUpNumClass(itemComponents.length));
		}

	}

});

RactiveF.components['ux-iconbaritem'] = Ractive.extend({

	template: RactiveF.templates['ux-iconbaritem'],

	computed: {
		guid: function () {
			return this._guid;
		}
	}

});

RactiveF.components['ux-li'] = Ractive.extend({
	template: RactiveF.templates['ux-li']
});

RactiveF.components['ux-panel'] = Ractive.extend({
	template: RactiveF.templates['ux-panel']
});

RactiveF.components['ux-pricingtable'] = Ractive.extend({
	template: RactiveF.templates['ux-pricingtable'],
	oninit: function () {

		this.on('buyNow', function (syntheticEvent) {

			if (!syntheticEvent.context.status || 'buynow' === syntheticEvent.context.status) {
				return;
			}

			// Else - it's in a disabled state, so stop the browser's default action for an anchor.
			syntheticEvent.original.preventDefault();

		});

	}
});

RactiveF.components['ux-row'] = Ractive.extend({
	template: RactiveF.templates['ux-row']
});

RactiveF.components['ux-sidenav'] = Ractive.extend({
	template: RactiveF.templates['ux-sidenav']
});

RactiveF.components['ux-tabarea'] = Ractive.extend({

	template: RactiveF.templates['ux-tabarea'],

	data: {
		tabPaneDataModel: function (item) {
			return {
				content: item.content
			};
		}
	},

	oninit: function () {

		var tabLinks = this.findComponent('ux-tablinks');
		var tabPanes = this.findComponent('ux-tabpanes');

		if (!tabLinks || !tabPanes) {
			// Because datamodel driven components can trigger this too early?
			return;
		}

		var tabLink = tabLinks.findAllChildComponents('ux-tablink');
		var tabPane = tabPanes.findAllChildComponents('ux-tabpane');

		_.each(tabLink, function (link, i) {
			var childPane = tabPane[i];
			if (childPane) {
				link.set({
					tabPane: childPane,
					uid: link._guid
				});
			}
		});
	}

});

RactiveF.components['ux-tablink'] = Ractive.extend({
	template: RactiveF.templates['ux-tablink'],
	components: RactiveF.components,
	isolated: true,
	oninit: function () {
		var active = this.get('active') || false;
		var tabPane = this.get('tabPane') || null;

		if (tabPane) {
			tabPane.set('active', active);
		}
	}
});

RactiveF.components['ux-tablinks'] = Ractive.extend({
	template: RactiveF.templates['ux-tablinks'],
	oninit: function () {

		// If there is a hash. We want to check deeplinking.
		if (window.location.hash.length) {
			var hash = window.location.hash.substr(1);
			var components = this.findAllChildComponents('ux-tablink');
			_.each(components, function (component) {
				var isActive = component.get('id') === hash;
				component.set('active', isActive);
				component.get('tabPane').set('active', isActive);
			});

		}

		this.on('*.changeTab', function (event) {
			var components = this.findAllChildComponents('ux-tablink');

			_.each(components, function (component) {
					var isActive = component._guid === event.context.uid;
					component.set('active', isActive);
					component.get('tabPane').set('active', isActive);
			});

			return false;
		});
	}
});

RactiveF.components['ux-tabpane'] = Ractive.extend({

	template: RactiveF.templates['ux-tabpane'],

	onconfig: function () {
		var datamodel = this.get('datamodel');
		if (datamodel) {
			// For datamodel driven components, the tab content can be html containing more ux components.
			// Therefore, we have to evaluate this, so we do that by injecting a partial here.
			// See http://docs.ractivejs.org/latest/partials#updating
			this.partials.dynamicContent = Ractive.parse(datamodel.content);
		}
	}

});

RactiveF.components['ux-tabpanes'] = Ractive.extend({
	template: RactiveF.templates['ux-tabpanes']
});

/* jshint ignore:end */
module.exports = RactiveF;