const Lang = imports.lang;
const Applet = imports.ui.applet;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Mainloop = imports.mainloop;
const Clutter = imports.gi.Clutter;
const St = imports.gi.St;
const Util = imports.misc.util;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;
const Gettext = imports.gettext;
const UUID = "gputemperature@silentage.com";

// l10n/translation support

Gettext.bindtextdomain(UUID, GLib.get_home_dir() + "/.local/share/locale")

function _(str) {
  return Gettext.dgettext(UUID, str);
}

var has_nvidia_smi=false;
var has_nvidia_settings=false;
var has_sensors=false;

/*   The Popup Menu */
function GPUMenu(launcher, orientation)
{
	this._init(launcher, orientation);
}

GPUMenu.prototype = 
{
		__proto__: PopupMenu.PopupMenu.prototype,
		_init: function(launcher, orientation)
		{
			this._launcher=launcher;
			PopupMenu.PopupMenu.prototype._init.call(this, launcher.actor, 0.0, orientation, 0);
			Main.uiGroup.add_actor(this.actor);
			this.actor.hide();
		}
}

/* The Applet */
function GPUTemp(orientation) 
{
	this._init(orientation);
}

GPUTemp.prototype = 
{
	__proto__: Applet.TextApplet.prototype,
	_init: function(orientation) 
	{
		Applet.TextApplet.prototype._init.call(this, orientation);
		try 
		{
			this.set_applet_label(_("GPU: ??\u1d3cC"));
			
			this.menuManager = new PopupMenu.PopupMenuManager(this);
			this.menu = new GPUMenu(this, orientation);
			this.menuManager.addMenu(this.menu);			
			
			//has_nvidia_smi=this._hasCommand("which nvidia-smi", ".*/nvidia-smi");
			has_nvidia_settings=this._hasCommand("which nvidia-settings", ".*/nvidia-settings");
			has_sensors=this._hasCommand("which sensors", ".*/sensors");

			if((has_nvidia_settings==true))
			{
				this.set_applet_tooltip(_("Current Temperature of your NVidia based GPU"));
				this._getNvidiaGpuTemperature();
			}
			else if(has_sensors==true)
			{
				this.set_applet_tooltip(_("Current Temperature of your ATI based GPU"));
				this._getAtiGpuTemperature();
			}
			else
			{
				this.set_applet_tooltip(_("No supported GPUs detected."));
				this._noGpuSource();
			}
		}
		catch (initerror) 
		{
			global.logError("init error:");
			global.logError(initerror);
		}
},
	},
	on_applet_clicked: function(event) 
	{
		this.menu.toggle();
		//this._getNvidiaGpuTemperature();
	}
};

function main(metadata, orientation) 
{
	let gpuTemp = new GPUTemp(orientation);
	return gpuTemp;
}
