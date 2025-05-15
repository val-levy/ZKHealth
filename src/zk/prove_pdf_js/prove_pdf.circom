include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";

template ProvePDF() {
    signal input fileHash;
    signal output is_valid;

    component hash = Poseidon(1);
    hash.inputs[0] <== fileHash;

    component isEq = IsEqual();
    isEq.in[0] <== hash.out;
    isEq.in[1] <== fileHash; // <-- or public pdf_hash if passed in
    is_valid <== isEq.out;
}

component main = ProvePDF();
