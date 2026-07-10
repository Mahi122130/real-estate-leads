import { MongoClient } from "mongodb";

const uri = "mongodb://mahelet2130_db_user:mahi2130@ac-qkyztdi-shard-00-00.wvovqyt.mongodb.net:27017,ac-qkyztdi-shard-00-01.wvovqyt.mongodb.net:27017,ac-qkyztdi-shard-00-02.wvovqyt.mongodb.net:27017/luxury_leads?ssl=true&authSource=admin&replicaSet=atlas-23fxwt-shard-0&retryWrites=true&w=majority";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;