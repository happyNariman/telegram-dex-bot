import { logger } from "@core/index.js";
import { UserDBModel } from "@models/index.js";
import { db, usersCollectionReference } from "./firebase.service.js";

export class UserDBService {
    private collectionRef: FirebaseFirestore.CollectionReference = usersCollectionReference;

    constructor() { }

    // async create(data: Omit<UserDBModel, 'id'>): Promise<string | null> {
    //     try {
    //         const docRef = await this.collectionRef.add(data);
    //         return docRef.id;
    //     } catch (error) {
    //         logger.error('Error creating document:', { error, data });
    //         return null;
    //     }
    // }

    async createWithCustomId(id: string, data: Omit<UserDBModel, 'id'>): Promise<void> {
        try {
            await this.collectionRef.doc(id).set(data);
        } catch (error) {
            logger.error('Error creating User document:', { error, id, data });
            throw error;
        }
    }

    async getAll(): Promise<UserDBModel[]> {
        try {
            const querySnapshot = await this.collectionRef.get();
            const users: UserDBModel[] = [];

            querySnapshot.forEach((doc) => {
                const userData = doc.data() as UserDBModel;
                users.push({ ...userData, id: doc.id });
            });

            return users;
        } catch (error) {
            logger.error('Error reading User documents:', error);
            return [];
        }
    }

    async getById(id: string): Promise<UserDBModel | null> {
        try {
            const docSnapshot = await this.collectionRef.doc(id).get();
            if (docSnapshot.exists) {
                const userData = docSnapshot.data() as UserDBModel;
                return { ...userData, id: docSnapshot.id };
            } else {
                return null;
            }
        } catch (error) {
            logger.error('Error getting User document:', { error, id });
            return null;
        }
    }

    async update(id: string, data: Partial<UserDBModel>): Promise<boolean> {
        try {
            await this.collectionRef.doc(id).update(data);
            return true;
        } catch (error) {
            logger.error('Error updating User document:', { error, id, data });
            return false;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            await this.collectionRef.doc(id).delete();
            return true;
        } catch (error) {
            logger.error('Error deleting User document:', { error, id });
            return false;
        }
    }
}
