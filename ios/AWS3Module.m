#import "AWS3Module.h"

#import "RCTBridge.h"

@implementation AWS3Module

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue
{
  return dispatch_queue_create("com.facebook.React.AsyncLocalStorageQueue", DISPATCH_QUEUE_SERIAL);
}

RCT_REMAP_METHOD(listObjects,
                 bucketName: (NSString *)bucketName resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{

  AWSS3ListObjectsRequest *listObjectsRequest = [AWSS3ListObjectsRequest new];
  listObjectsRequest.bucket = bucketName;

  AWSS3 *s3 = [AWSS3 S3ForKey: @"MyAWS3Config"];


  [[s3 listObjects:listObjectsRequest] continueWithBlock:^id(AWSTask *task) {

    if (task.error) {
       NSLog(@"listObjects failed: [%@]", task.error);
       resolve(@[]);
     } else {
       AWSS3ListObjectsOutput *listObjectsOutput = task.result;

       NSMutableArray *result = [[NSMutableArray alloc] init];

       for (AWSS3Object *s3Object in listObjectsOutput.contents) {
         [result addObject:@{
                             @"key": s3Object.key,
                             }];

       }

      resolve(result);

     }

    return nil;

  }];

}

RCT_REMAP_METHOD(delObject,
                 bucketName: (NSString *)bucketName key: (NSString *)key resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{

  AWSS3 *s3 = [AWSS3 S3ForKey: @"MyAWS3Config"];

  AWSS3DeleteObjectRequest *deleteObjectRequest = [AWSS3DeleteObjectRequest new];
  deleteObjectRequest.bucket = bucketName;
  deleteObjectRequest.key = key;

  [[s3 deleteObject:deleteObjectRequest] continueWithBlock:^id(AWSTask *task) {
    if (task.error) {
      NSLog(@"delObject failed: [%@]", task.error);
      resolve(@FALSE);
    } else {
      resolve(@TRUE);

    }
    return nil;
  }];

}




@end
