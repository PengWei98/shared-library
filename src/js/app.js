App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../books.json', function(data) {
      var booklist = $('#books');
      var book = $('#singlebook');

      for (i = 0; i < data.length; i ++) {
        book.find('.name').text(data[i].name);
        book.find('img').attr('src', data[i].picture);
        book.find('.author').text(data[i].author);
        book.find('.description').text(data[i].description);
        book.find('.btn-borrow').attr('data-id', data[i].id);
        book.find('.btn-return').attr('data-id', data[i].id);
        book.find('.btn-borrow').attr('id', "borrow" + data[i].id);
        book.find('.btn-return').attr('id', "return" + data[i].id);
        book.find('.information').attr('id', "information" + data[i].id);
        booklist.append(book.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {

    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    /*
     * Replace me...
     */
    $.getJSON('Book.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AdoptionArtifact = data;
      App.contracts.Book = TruffleContract(AdoptionArtifact);
    
      // Set the provider for our contract
      App.contracts.Book.setProvider(App.web3Provider);


      return App.isBorrowed();
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-borrow', App.borrowBook);
    $(document).on('click', '.btn-return', App.returnBook);
  },

  isBorrowed: function(people, account) {
    var adoptionInstance;

    // web3.eth.getAccounts(function(error, accounts) {
    //   if (error) {
    //     console.log(error);
    //   }
    //   var userAccount = accounts[0];
    // $("#user").html("当前账户: " + userAccount);
      
    // });

    //   var userAccount = accounts[0];
    // $("#user").html("Your Account: " + userAccount);
    App.contracts.Book.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getBorrower.call();
    }).then(function(people) {
      for (i = 0; i < people.length; i++) {
        if (people[i] !== '0x0000000000000000000000000000000000000000') {

          $("#borrow" + i).text("已借阅").attr('disabled',true);
          $("#return" + i).text("归还").attr('disabled',false);
          $("#information" + i).text("借书人账户：" + people[i]);
        }
        else{

          $("#return" + i).text("未借出").attr('disabled',true);
          $("#borrow" + i).text("借阅").attr('disabled',false);
          $("#information" + i).text("");
        }
        
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  borrowBook: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));
    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Book.deployed().then(function(instance) {
        adoptionInstance = instance;
        // Execute adopt as a transaction by sending account
        return adoptionInstance.borrowBook(petId, {from: account});
      }).then(function(result) {
        window.alert("借阅成功！");
        return App.isBorrowed();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  returnBook: function(event, people) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Book.deployed().then(function(instance) {
        adoptionInstance = instance;

        return adoptionInstance.getBorrower.call();
    }).then(function(people) {

        if(people[petId] !== account){
          window.alert("你不是借书人！");
          return;
        }

        window.alert("归还时需要支付10以太币的结算费用！")
        adoptionInstance.sendTransaction( {from :web3.eth.accounts[0], to: "0x6226121080E9aD56938147F97e547A7697c579cA", value: web3.toWei("10","ether")});
        // Execute return as a transaction by sending account
        return adoptionInstance.returnBook(petId, {from: account});
      }).then(function(result) {
        if(people[petId] === account){
          window.alert("归还成功！");
        }
        return App.isBorrowed();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
