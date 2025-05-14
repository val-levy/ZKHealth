export interface Medrec {
    id: string;
    patientId: string;
    data: string;
    timestamp: Date;
}

export interface Transaction {
    id: string;
    type: string;
    amount: number;
    sender: string;
    receiver: string;
    timestamp: Date;
}