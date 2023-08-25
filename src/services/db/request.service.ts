import { Logger } from 'winston';
import firebase from 'firebase-admin';
import { RequestDBModel, UserDBModel } from '@models/index.js';

export class RequestDBService {
    private readonly collectionRef: FirebaseFirestore.CollectionReference;

    constructor(private logger: Logger) {
        this.collectionRef = firebase.firestore().collection('users');
    }

    async create(userId: string, data: RequestDBModel): Promise<void> {
        try {
            const userDoc = this.collectionRef.doc(userId);
            const requestsCollection = userDoc.collection('requests');
            await requestsCollection.doc(new Date().toISOString()).set(data);
        } catch (error) {
            this.logger.error('Error creating User document:', { error, userId, data });
            throw error;
        }
    }

    async getCountUserRequestsByDate(userId: string, date: Date): Promise<number> {
        const startDate = new Date(date);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setUTCHours(23, 59, 59, 999);

        const query = this.collectionRef.doc(userId)
            .collection('requests')
            .where('timestamp', '>=', startDate)
            .where('timestamp', '<=', endDate);

        const snapshot = await query.count().get();
        return snapshot.data().count;
    }

    async getUserRequestsByDate(userId: string, date: Date): Promise<RequestDBModel[]> {
        const startDate = new Date(date);
        startDate.setUTCHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setUTCHours(23, 59, 59, 999);

        const query = this.collectionRef.doc(userId)
            .collection('requests')
            .where('timestamp', '>=', startDate)
            .where('timestamp', '<=', endDate);

        const snapshot = await query.get();
        const documents = snapshot.docs.map(doc => doc.data() as RequestDBModel);
        return documents;
    }

}
