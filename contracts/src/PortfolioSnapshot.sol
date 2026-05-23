// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title PortfolioSnapshot
/// @notice Records keccak256 portfolio fingerprints with timestamp + Base Builder attribution.
/// Each user can append snapshots; the contract emits an event used by indexers and exposes
/// per-user lookup. No funds are held; this is a pure write/append ledger.
contract PortfolioSnapshot {
    struct Snapshot {
        bytes32 fingerprint;
        uint64 timestamp;
        bytes8 builderCode;
    }

    mapping(address => Snapshot[]) private _snapshots;
    uint256 public totalSnapshots;

    event SnapshotRecorded(
        address indexed user,
        uint256 indexed index,
        bytes32 fingerprint,
        uint64 timestamp,
        bytes8 builderCode
    );

    error EmptyFingerprint();

    /// @notice Append a snapshot for the caller.
    /// @param fingerprint keccak256 of the off-chain portfolio payload.
    /// @param builderCode 8-byte Base Builder attribution tag (zero = none).
    function record(bytes32 fingerprint, bytes8 builderCode) external returns (uint256 index) {
        if (fingerprint == bytes32(0)) revert EmptyFingerprint();

        index = _snapshots[msg.sender].length;
        _snapshots[msg.sender].push(
            Snapshot({
                fingerprint: fingerprint,
                timestamp: uint64(block.timestamp),
                builderCode: builderCode
            })
        );
        unchecked {
            ++totalSnapshots;
        }

        emit SnapshotRecorded(msg.sender, index, fingerprint, uint64(block.timestamp), builderCode);
    }

    function snapshotCount(address user) external view returns (uint256) {
        return _snapshots[user].length;
    }

    function snapshotAt(address user, uint256 index) external view returns (Snapshot memory) {
        return _snapshots[user][index];
    }

    function latest(address user) external view returns (Snapshot memory) {
        Snapshot[] storage list = _snapshots[user];
        require(list.length > 0, "no snapshots");
        return list[list.length - 1];
    }
}
