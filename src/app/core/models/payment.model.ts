export interface Payment {

    id: string;

    sessionId: string;

    patientId: string;

    patientName: string;

    therapistId: string;

    amount: number;

    method: string;

    status: string;

    createdAt: string;

}