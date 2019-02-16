
pragma solidity ^0.5.0;

contract Book {
    address[10] public people;
    function () payable external{
    }

    function borrowBook(uint id) public returns (uint) {
        require(id >= 0 && id <= 10);

        people[id] = msg.sender;

        return id;
    }

    function returnBook(uint id) public returns (uint) {
        require(id >= 0 && id <= 10);

        people[id] = 0x0000000000000000000000000000000000000000;

        return id;
    }
    

    function getBorrower() public view returns (address[10] memory) {
        return people;
    }
}
