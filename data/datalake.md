"I'm building a data lake."  
"What is a data lake?"

This is one of the frequently asked questions when I explain what I do for work.

Introduction
------------

Disclaimer: I'm writing this article to briefly explain what a data lake is about and touch base on some of the key challenges. It is not intended to be a definite guide for data lake builders. It is also worthwhile to note that data lakes take many different forms across companies and organizations depending on their needs. This article reflects my own experience and thus it may not cover the fullest extent of the term *data lake*. Without further ado, let's begin.

A data lake is a system or repository of data stored in its raw format, usually object blobs or files.

<img src="http://www.igfasouza.com/blog/wp-content/uploads/2019/05/bigdata_datalake.jpg" style="width:50%; display:block; margin:auto;"/>

That probably does not make much sense unless you have some background knowledge or related experience. So I will start with a concept that most software engineers are familiar with - database - and then gradually build upon it.

Database systems are generally expected to respond to user requests immediately. Take a typical website, that relies on a [relational database system](https://en.wikipedia.org/wiki/Relational_database) as a persistent datastore, as an example. The usual *businesses* such as `SELECT`, `INSERT`, `UPDATE`, and `DELETE` should take no more than a few milliseconds (or perhaps tens of milliseconds if users are generous and patitient) in average cases.

This type of work is referred as [Online Transaction Processing (OLTP)](https://en.wikipedia.org/wiki/Online_transaction_processing). Genernally speaking, OLTP tasks involve transactions with small amounts of data, indexed access to data, and frequent queries and updates. OLTP systems serve a vast range of businesses including, but not limited to, online banking, payments, shopping, booking airline tickets and hotel rooms where users expect real-time responses. 

As opposed to OLTP, there is another type of work which is referred as [Online Analytical Processing (OLAP)](https://en.wikipedia.org/wiki/Online_analytical_processing). Behind the scene, there are demands to execute more complicated and sophisticated queries to generate business reports, make predictions and forecasts, assign crews and resources, plan delivery routes, run optimization algorithms, detect abnormalities, and so on and so forth. These types of queries tend to take significantly more time than OLTP works; minutes, hours, or even longer in some extreme cases.

This is where a data warehouse comes into play to effectively handle analytical works. Unlike databases, data is loaded in bulk and updated infrequently. Often times, data is integrated from multiple source systems, enabling a central view across the enterprise.[^1] Data may or may not be restructured depending on the business needs. Denormalization of data often takes place to aid certain analytical works.


There is nothing wrong with running analytics on a traditional database system, as long as they don't interfere with real-time requests, but building a data warehouse tends to be more cost effective.

Based on the knowledge we have built up so far, we can finally explain what a data lake is, by comparing it with a data warehouse. There are a few differences. The first aspect, which is arguably the most fundamental difference, is that the purpose of the data in a data warehouse is pre-determined whereas the purpose of the data in a data lake may or may not be determined at the time of loading. The second is that data stored in a data warehouse is structured and refined according to the purpose, whereas a data lake stores data in its unprocessed, raw form. Consequently, unlike a data warehouse, users without software engineering capabilities may not be able to use a data lake directly.

[^1]: <https://en.wikipedia.org/wiki/Data_warehouse>

Key Challenges
--------------

If a data lake is marely a central datastore where we store everything as-is, without structures, pre-processing, or whatsoever, what's the big deal about it? It shouldn't be too difficult to build one, right? That's exactly what I initially thought before signing up for this project.

### Sheer Scale

I would imagine this is the most obvious challenge of all. When it comes to scale, there are two main types of complications: volume and velocity. Volume, which is pretty much self-explanatory, refers the size of the data stored in, and velocity refers the speed at which the data comes in.

When dealing with hundreds of terabytes or even petabytes of data, how would you store them? How would you make them readily accessible? Is your storage system reliable? Is it cost-effective?

When millions of records are flooding into the datastore every minute, how would you ensure that your system is capturing everything without loss? When one or more data ingestion nodes become temporarily unavailable, what kind of strategy would you employ to prevent data loss and ensure your data ingestion capacity does not fall behind during this temporary degradation?

### Exactly-once Semantics

In the realm of distributed systems, it is practially impossible to guarantee to deliver a message exactly once. It is either at-most-once delivery or at-least-once delivery.

You may be inclined to the latter because having intermittently duplicated records is slightly better than losing records as far as datastore systems are concerned. If primary keys are defined for those records, you may be able to deduplicate records later on. But can you do it fast given the scale of your data sets? Imagine storing all web server logs in a data lake. Is deduplication possible if primary keys are unavailble?

### Evolving Schema

Although data lakes load data in their raw format without any modification, that does not necessarily mean data schema can be entirely disregarded. Often times, *customers* of the data lake expect the data available in a usable format. [Hive](https://hive.apache.org/) tables are one of such examples. Otherwise they might have to dig through raw [ORC](https://orc.apache.org/) or [Parquet](http://parquet.apache.org/) files. It may or may not be possible depending on whether the customer has software engineering capabiltiies.

Sometimes it is possible to obtain a precise schema definition for a certain set of data from its original author or producer, sometimes it is not; although it does not take too much effort to infer data schema by scanning the entire data set. But what if columns are added or deleted along the way? What if column names are changed or their types are changed? How would you cope with these kinds of changes if schema registry is not available? Would you migrate old data? What if the size of the old data is in a range of patebytes? Is data migration even a viable option?

### Security

Last but not least, there are some security matters that must be taken care of. Suppose you are running an e-commerce service. As your business is booming, people from all around the world are singing up as a member. Due the nature of the e-commerce business, your service is bound to collect personally identifiable information (PII) such as names, phone numbers, and postal addresses, along with other sensitive information such as credit card numbers.

Handling PII is a risky business. Any form of compromise on a PII datastore is an express ticket to legal disputes and procecutions. Not to mention serious damages on the reputation of your business. In order to prevent such impediments, a high level of caution must be taken.

Data encryption provides some level of protection against potential threats during data storage and transport. However, it cannot safeguard the data from malicious intentions or carelessness of insiders.

It would be ideal to have a tight access control and an audit system. An access control system grants users an appropriate level of access to the data on a need-to-know basis. An audit system provides a way to inspect and examine activities within the system to ensure compliance to requirements.

If that is not an option, you may consider masking or deleting all sensitive information as a minimal effort to prevent potential information leakage.

Some portion of existing members would inevitably want to terminate their membership for various reasons. In such cases, depending on the local regulations with which your business is complying, you may be required to mask or delete any information related to the withdrawn members.

Not many people would stand up against the importance of security. But challenges come from the scale of the data. Can you encrypt and decrypt fast enough? Is fine grained access control possible on a large set of data? How long would it take to go through the entire data set to handle all records belonging to the former members?

Remember a data lake is not a database. It is generally impossible to manipulate individual records; you are likely able to work on a partition level, meaning you have to overwrite the entire partition if you want to insert, update, or delete a single record in a certain partition.


Discussion
----------

### Why not use off-the-shelf solutions?

This is a great question indeed. (TODO: Finish this section)

<!--
https://aws.amazon.com/solutions/data-lake-solution/
-->


Wrap Up
-------

Following the definition of a data lake, it may sound quite simple to build one. But, just like anything else, it comes with its own unique set of challenges. The sheer scale of the data that a data lake typically faces is likely the source of all the challenges. Exactly-once semantics and evolving schema would not be an issue otherwise. Also, we can never be too careful when it comes to security.

After all, the purpose of this article is to provide a brief explanation of typical challenges of building an enterprise data lake. If you are interested in tackling these kinds of problems, please do not hesitate to [reach out to me](mailto:suminb@gmail.com) with your up-to-date CV.