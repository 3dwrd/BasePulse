// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PortfolioSnapshot} from "../src/PortfolioSnapshot.sol";

contract PortfolioSnapshotTest is Test {
    PortfolioSnapshot internal snap;
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);
    bytes8 internal constant CODE = bytes8(hex"4241534550554c53");

    event SnapshotRecorded(
        address indexed user,
        uint256 indexed index,
        bytes32 fingerprint,
        uint64 timestamp,
        bytes8 builderCode
    );

    function setUp() public {
        snap = new PortfolioSnapshot();
    }

    function test_record_storesAndEmits() public {
        bytes32 fp = keccak256("portfolio-v1");
        vm.warp(1_700_000_000);
        vm.expectEmit(true, true, false, true);
        emit SnapshotRecorded(alice, 0, fp, uint64(1_700_000_000), CODE);

        vm.prank(alice);
        uint256 idx = snap.record(fp, CODE);

        assertEq(idx, 0);
        assertEq(snap.snapshotCount(alice), 1);
        assertEq(snap.totalSnapshots(), 1);

        PortfolioSnapshot.Snapshot memory s = snap.snapshotAt(alice, 0);
        assertEq(s.fingerprint, fp);
        assertEq(s.timestamp, 1_700_000_000);
        assertEq(s.builderCode, CODE);
    }

    function test_record_appendsPerUser() public {
        vm.startPrank(alice);
        snap.record(keccak256("a1"), CODE);
        snap.record(keccak256("a2"), CODE);
        vm.stopPrank();

        vm.prank(bob);
        snap.record(keccak256("b1"), bytes8(0));

        assertEq(snap.snapshotCount(alice), 2);
        assertEq(snap.snapshotCount(bob), 1);
        assertEq(snap.totalSnapshots(), 3);

        PortfolioSnapshot.Snapshot memory latestAlice = snap.latest(alice);
        assertEq(latestAlice.fingerprint, keccak256("a2"));
    }

    function test_record_rejectsEmpty() public {
        vm.prank(alice);
        vm.expectRevert(PortfolioSnapshot.EmptyFingerprint.selector);
        snap.record(bytes32(0), CODE);
    }

    function test_latest_revertsWhenEmpty() public {
        vm.expectRevert(bytes("no snapshots"));
        snap.latest(alice);
    }

    function test_snapshotAt_revertsOutOfBounds() public {
        vm.prank(alice);
        snap.record(keccak256("x"), CODE);
        vm.expectRevert();
        snap.snapshotAt(alice, 5);
    }

    function testFuzz_record_acceptsAnyNonZero(bytes32 fp, bytes8 code) public {
        vm.assume(fp != bytes32(0));
        vm.prank(alice);
        uint256 idx = snap.record(fp, code);
        assertEq(idx, 0);
        PortfolioSnapshot.Snapshot memory s = snap.snapshotAt(alice, 0);
        assertEq(s.fingerprint, fp);
        assertEq(s.builderCode, code);
    }
}
