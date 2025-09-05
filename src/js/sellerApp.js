App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        console.error("User denied account access");
      }
    } else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }

    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    return $.getJSON('product.json', function(data) {
      var productArtifact = data;
      App.contracts.product = TruffleContract(productArtifact);
      App.contracts.product.setProvider(App.web3Provider);

      return App.bindEvents();
    });
  },

  bindEvents: function() {
    $('#register').on('click', App.registerProduct);
  },

  registerProduct: function(event) {
    event.preventDefault();

    let statusDiv = $('#statusMessage');
    statusDiv.text('Seller is being added...').css('color', 'blue'); // immediate feedback

    let sellerName = $('#SellerName').val();
    let sellerBrand = $('#SellerBrand').val();
    let sellerCode = $('#SellerCode').val();
    let sellerPhoneNumber = $('#SellerPhoneNumber').val();
    let sellerManager = $('#SellerManager').val();
    let sellerAddress = $('#SellerAddress').val();
    let manufacturerId = $('#ManufacturerId').val();

    if (!sellerName || !sellerBrand || !sellerCode || !sellerPhoneNumber || !sellerManager || !sellerAddress || !manufacturerId) {
      statusDiv.text("⚠️ Please fill in all fields.").css('color', 'red');
      return;
    }

    web3.eth.getAccounts().then(function(accounts) {
      var account = accounts[0];
      var productInstance;

      App.contracts.product.deployed().then(function(instance) {
        productInstance = instance;

        return productInstance.addSeller(
          web3.utils.asciiToHex(manufacturerId),
          web3.utils.asciiToHex(sellerName),
          web3.utils.asciiToHex(sellerBrand),
          web3.utils.asciiToHex(sellerCode),
          sellerPhoneNumber,
          web3.utils.asciiToHex(sellerManager),
          web3.utils.asciiToHex(sellerAddress),
          { from: account }
        );
      }).then(function(result) {
        statusDiv.text("✅ Seller added successfully!").css('color', 'green');

        // Clear inputs after success
        $('#SellerName').val('');
        $('#SellerBrand').val('');
        $('#SellerCode').val('');
        $('#SellerPhoneNumber').val('');
        $('#SellerManager').val('');
        $('#SellerAddress').val('');
        $('#ManufacturerId').val('');
      }).catch(function(err) {
        console.error(err.message);
        statusDiv.text("❌ Error adding seller. See console.").css('color', 'red');
      });
    });
  }
};

$(document).ready(function() {
  App.init();
});
