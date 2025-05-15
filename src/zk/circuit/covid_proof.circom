pragma circom 2.0.0;
include "circomlib/circuits/poseidon.circom";

template CovidProof() {
    signal input vaccine;
    signal input doses;
    signal input date1;
    signal input date2;
    signal input commitment;

    component hash = Poseidon(4);
    hash.inputs[0] <== vaccine;
    hash.inputs[1] <== doses;
    hash.inputs[2] <== date1;
    hash.inputs[3] <== date2;

    hash.out === commitment;

    // Check vaccine == Pfizer (hardcoded value)
    signal cond1;
    cond1 <== vaccine - 104874423883;
    assert(cond1 == 0);

    // Check doses >= 2
    signal cond2;
    cond2 <== doses - 2;
    assert(cond2 >= 0);
}

component main = CovidProof();
