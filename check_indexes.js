
import indexes from "./src/backend/indexing/indexes.json" with { type: "json" };

console.log("Cost Buckets:", Object.keys(indexes.costBucket));
console.log("Calorie Buckets:", Object.keys(indexes.calorieBucket));
console.log("Counts in Cost:");
for (let k in indexes.costBucket) console.log(`  ${k}: ${indexes.costBucket[k].length}`);
console.log("Counts in Calorie:");
for (let k in indexes.calorieBucket) console.log(`  ${k}: ${indexes.calorieBucket[k].length}`);
