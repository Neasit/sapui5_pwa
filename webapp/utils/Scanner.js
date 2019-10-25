/* global ZXing:true */
sap.ui.define(
  [
    'sap/ui/base/Object',
    'sap/ui/Device',
    'sap/m/Button',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageToast',
    'sap/m/ResponsivePopover',
    'sap/m/List',
    'sap/m/DisplayListItem',
    'pslint/exp/libs/zxingjs0151.min',
    'jquery.sap.global',
  ],
  function(
    UI5Object,
    Device,
    Button,
    JSONModel,
    MessageToast,
    ResponsivePopover,
    List,
    DisplayListItem
  ) {
    return UI5Object.extend('pslint.exp.utils.Scanner', {
      constructor: function(bEdit, oParent, oi18n, fOnScanned, fOnCancel) {
        this._oToolbar = null;
        this._oScanModel = null;
        this._oTD = null; // sacn dialog
        this._oID = null; // input dialog
        this._oBtn = null;

        this._oScanModel = new JSONModel({
          editButton: bEdit,
          changeButton: true,
          value: '',
          videoDeviceId: null,
        });
        this._deviceModel = new JSONModel(Device);
        this.bEdit = bEdit;
        this.oParent = oParent;
        this._oi18n = oi18n;
        this.fOnCancel = fOnCancel;
        this.fOnScanned = fOnScanned;
      },
      /**
       * Opens the dialog for selecting a customer.
       * @public
       */
      open: function() {
        this.onShowDialog();
      },

      onChangePress: function(oEvent) {
        var aDevices = this._oScanModel.getProperty('/videoDevices');
        if (aDevices && aDevices.length > 1) {
          if (aDevices.length === 2) {
            var sCurrent = this.getCurrentVideoDevice();
            aDevices.some(
              function(item) {
                if (item.deviceId !== sCurrent) {
                  this.changeDevice(item.deviceId);
                  return true;
                }
                return false;
              }.bind(this)
            );
          } else {
            this.openChangePopover(oEvent.getSource());
          }
        }
      },

      onChangeDevice: function(oEvent) {
        var oItem = oEvent.getProperty('listItem');
        var sId = oItem.getValue();
        this.getChangePopover().close();
        this.changeDevice(sId);
      },

      changeDevice: function(sId) {
        this._oScanModel.setProperty('/videoDeviceId', sId);
        this._stopScan();
        this._startScan();
      },

      getChangePopover: function() {
        if (!this._oChangePopover) {
          var oList = new List({
            mode: 'SingleSelectMaster',
          });
          oList.setModel(this._oScanModel);
          oList.bindItems({
            path: '/videoDevices',
            template: new DisplayListItem({
              value: '{label}',
            }),
          });
          this._oChangePopover = new ResponsivePopover({
            class: 'sapUiContentPadding',
            showHeader: false,
            selectionChange: this.onChangeDevice.bind(this),
          });
          this._oChangePopover.addContent(oList);
        }
        return this._oChangePopover;
      },

      openChangePopover: function(oSource) {
        var oPopover = this.getChangePopover();
        var oList = oPopover.getContent()[0];
        if (oList) {
          var sSelectedId = this.getCurrentVideoDevice();
          if (sSelectedId) {
            var oSelectedItem = this._oScanModel.getProperty('/videoDevices').find(function(item) {
              return item.deviceId === sSelectedId;
            });
            var oItem = oList.getItems().find(function(item) {
              return item.getValue() === oSelectedItem.label;
            });
            if (oItem) {
              oList.setSelectedItem(oItem);
            }
          } else {
            oList.removeSelections(true);
          }
        }
        oPopover.openBy(oSource, false);
      },

      getCurrentVideoDevice: function() {
        var sId = this._oScanModel.getProperty('/videoDeviceId');
        if (!sId) {
          if (this._oDecoder && this._oDecoder.stream) {
            var oTrack = this._oDecoder.stream.getVideoTracks()[0];
            if (oTrack) {
              var oCap = oTrack.getCapabilities ? oTrack.getCapabilities() : oTrack.getSettings();
              if (oCap) {
                sId = oCap.deviceId;
              }
            }
          }
        }
        return sId;
      },

      onShowDialog: function() {
        this._oDecoder = this._getMultiCodeDecoder();
        if (this._oDecoder) {
          this._oDecoder
            .getVideoInputDevices()
            .then(
              function(aDevices) {
                this._oScanModel.setProperty('/videoDevices', aDevices);
                if (aDevices && aDevices.length) {
                  if (aDevices.length === 1) {
                    this._oScanModel.setProperty('/changeButton', false);
                  } else {
                    this._oScanModel.setProperty('/changeButton', true);
                  }
                  return true;
                } else {
                  throw new Error('No video devices');
                }
              }.bind(this)
            )
            .then(
              function() {
                this._showScanDialog();
              }.bind(this)
            )
            .catch(
              function(error) {
                jQuery.sap.log.warning(error);
                this._showInputDialog();
              }.bind(this)
            );
        }
      },

      onCancelPress: function(oEvent) {
        var oDialog = oEvent.getSource().getParent();
        oDialog.close();
        this.fOnCancel();
        this._oScanModel.setProperty('/value', '');
      },

      onOkPress: function(oEvent) {
        var oDialog = oEvent.getSource().getParent();
        oDialog.close();
        this.fOnScanned(this._oScanModel.getProperty('/value'));
        this._oScanModel.setProperty('/value', '');
      },

      _getOpenButton: function() {
        if (!this._oBtn) {
          this._oBtn = new Button(this.createId('idScanOpenDialogBtn'), {
            icon: 'sap-icon://bar-code',
            press: this.onShowDialog.bind(this),
          });
        }
        return this._oBtn;
      },

      _getMultiCodeDecoder: function() {
        if (!this._oMultiCodeDecoder) {
          this._oMultiCodeDecoder = new ZXing.BrowserMultiFormatReader();
        }
        return this._oMultiCodeDecoder;
      },

      _showInputDialog: function() {
        this._openDialog(this._getInputDialog());
      },

      _showScanDialog: function() {
        this._openDialog(this._getScanDialog());
      },

      _openDialog: function(oDialog) {
        if (this._deviceModel.getProperty('/system/phone') === true) {
          oDialog.setStretch(true);
        } else {
          oDialog.setStretch(false);
        }
        oDialog.open();
      },

      _getScanDialog: function() {
        if (!this._oTD) {
          this._oTD = sap.ui.xmlfragment(
            this.oParent.getView().getId(),
            'pslint.exp.fragments.scanDialog',
            this
          );
          this._oTD.setModel(this._oScanModel, 'scanModel');
          this._oTD.setModel(this._oi18n, 'i18n');
          this._oTD.addStyleClass(this.getContentDensityClass());
          if (this.bEdit === true) {
            this._addHeader(this._oTD);
          }
          this._oTD.attachAfterOpen(this._onAfterOpen.bind(this));
          this._oTD.attachAfterClose(this._onAfterClose.bind(this));
        }
        return this._oTD;
      },

      _getInputDialog: function() {
        if (!this._oID) {
          this._oID = sap.ui.xmlfragment(
            this.oParent.getView().getId(),
            'pslint.exp.fragments.inputDialog',
            this
          );
          this._oID.addStyleClass(this.getContentDensityClass());
          this._oID.setModel(this._oScanModel, 'scanModel');
          this._oID.setModel(this._oi18n, 'i18n');
        }
        return this._oID;
      },

      _addHeader: function(oDialog) {
        if (oDialog) {
          var oHeader = this._getDialogHeader();
          oDialog.setCustomHeader(oHeader);
          oDialog.invalidate();
        }
      },

      _startScan: function() {
        var aContent = this._getScanDialog().getContent();
        if (aContent && aContent.length) {
          var oVideoContent = aContent[0];
          this._oDecoder.decodeFromVideoDevice(
            this._oScanModel.getProperty('/videoDeviceId'),
            oVideoContent.getId(),
            this._saveScannedValue.bind(this)
          );
        }
      },

      _stopScan: function() {
        this._oDecoder.stopContinuousDecode();
        this._oDecoder.stopAsyncDecode();
        this._oDecoder.reset();
      },

      _onAfterOpen: function() {
        this._startScan();
      },

      _onAfterClose: function() {
        this._stopScan();
      },

      _onBarCodePress: function() {
        this._oScanModel.setProperty('/value', '');
        this._startScan();
      },

      _saveScannedValue: function(result, error) {
        if (result) {
          this._oScanModel.setProperty('/value', result.text);
          if (this.bEdit === false) {
            this.fOnScanned(result.text);
            this._getScanDialog().close();
          } else {
            MessageToast.show(result.text);
          }
        }
        if (error && !(error instanceof ZXing.NotFoundException)) {
          jQuery.sap.log.warning('Error by decode from video stream (Multi)');
          jQuery.sap.log.warning(error);
        }
      },

      _getDialogHeader: function() {
        if (!this._oHeader) {
          this._oHeader = sap.ui.xmlfragment(
            this.oParent.getView().getId(),
            'pslint.exp.fragments.toolbar',
            this
          );
          this._oHeader.setModel(this._oScanModel, 'scanModel');
          this._oHeader.setModel(this._oi18n, 'i18n');
        }
        return this._oHeader;
      },

      /**
       * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
       * design mode class should be set, which influences the size appearance of some controls.
       * @private
       * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
       */
      getContentDensityClass: function() {
        if (this._sContentDensityClass === undefined) {
          // check whether FLP has already set the content density class; do nothing in this case
          if (
            jQuery(document.body).hasClass('sapUiSizeCozy') ||
            jQuery(document.body).hasClass('sapUiSizeCompact')
          ) {
            this._sContentDensityClass = '';
          } else if (!Device.support.touch) {
            // apply "compact" mode if touch is not supported
            this._sContentDensityClass = 'sapUiSizeCompact';
          } else {
            // "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
            this._sContentDensityClass = 'sapUiSizeCozy';
          }
        }
        return this._sContentDensityClass;
      },
    });
  }
);
