---
layout: post
title: 【emnlp2020】Translation Quality Estimation by Jointly Learning to Score and Rank
---


[本文开源代码](https://github.com/jingyiz/sentence-transformers)


## 主要内容

一句话概括

- 提出一个多任务学习 QE 模型，联合学习评分和排名两个任务

动机

- qe任务需要人类评估的有监督数据，例如DA（Direct Assessment），RR（Relative Ranking）；DA可直接用于QE as a Metric task，但为了利用更多数据，采用多任务学习

优势&主要贡献

- 多任务学习相比两种数据分开学习 效果好
- 本文达到了WMT 2019 QE as a Metric task的sota，超过了sentBLEU
- 现有qe模型（基于跨语言词句embedding）在不同语言对上效果差且不稳定，本文模型更鲁棒且效果好（为什么

idea&方法

- 多任务学习的qe模型：同时学习翻译打分和翻译排名
- M-BERT 获取跨语言句子表示，一个句子经过多语bert，输出做mean pooling，得到句向量
- 在qe任务上微调M-BERT
- 打分任务：源句s和目标句t，计算cosine相似度
  - 也尝试了s和t concat起来过一个线性层，但是效果不够好
  ![L_score](/images/2021/0715_1.png)
- 排名任务：分别计算两个翻译t，和源句的欧氏距离，希望好的翻译能比不好的翻译 至少离源句更近\epsilon
  - 也尝试了cosine相似度，效果不够好
  ![L_rank](/images/2021/0715_2.png)
- 多任务学习：每个step包括两个batch的训练数据，分别是打分和排名；打分使用DA数据，排名使用RR数据

实验
- 配置
  - 训练数据                           
  ![traindata](/images/2021/0715_3.png)
  - 两个任务一起学习，但是保存DA做得最好的ckpt，因为最终目标是da
  - 模型                                   
  ![models](/images/2021/0715_4.png)
- 实验结果-Segment-Level
  ![result1](/images/2021/0715_5.png)
  ![result2](/images/2021/0715_6.png)
  ![result3](/images/2021/0715_7.png)
  - 多任务学习效果优于只使用DA数据
  - XLM-RoBERTa 优于 M-BERT
  - 无监督语言对效果也好
- 不同的pooling策略：MEAN最好
  ![pooling](/images/2021/0715_8.png)
- 实验结果-System-Level
  ![result4](/images/2021/0715_9.png)
  ![result5](/images/2021/0715_10.png)
  - System-Level 的话，可以用ref的metric有更好效果，qe的话就在不同语言对之间不太稳定
  - 本文模型倾向于为System-Level评估产生比Segment-Level评估更不稳定的结果，这可能是因为Segment-Level相关性是使用大约 2000 个语言对的段来计算的，而System-Level 一个语言对仅使用大约 10 个系统计算相关性，因此Segment-Level相关性更稳定。

结论
- 本文提出了一种多任务学习 QE 模型，该模型联合学习两个任务，对翻译进行评分并对两个翻译进行排名。 人工评估员的评分和排序结果可以作为训练数据，分别用于学习评分和排序任务。 这两个密切相关的任务的多任务学习使我们能够利用两种类型的人类评估数据进行模型训练，与单独学习这两个任务相比，提高了性能。 我们的模型在 WMT 2019 QE 上作为指标任务获得了最新的最新结果，并在 WMT 2019 指标任务上优于 sentBLEU。

零散的细节
- WMT 2019 QE as a Metric task 的 sota
- QE as a Metric任务 对句子级翻译进行评分，与句子级QE任务类似，区别在于：句子级QE任务的目标是预测修复翻译所需的编辑百分比，以达到后期编辑的目的；而QE as a Metric任务的目标是估计翻译的一般质量，就像机器翻译（MT）评估指标，如BLEU和Meteor


## 思考总结

一些想法&疑惑
- 想法：感觉，随着da目标出现，句子级和metric没区别了，都是预测句子一般质量。
- 疑惑：cross-lingual sentence embeddings 是什么
- 疑惑：sentBLEU是什么
- 想法：本文是不同任务互相帮助，也算数据增强，或者说相关任务之间的知识迁移
- 疑惑：Segment-Level 和 System-Level 是什么区别
- 疑惑：为什么本文模型对不同语言对效果稳定，但是UNI和YiSi系列不行？
- 想法：训练轮数（在qe数据上训练的充分程度）和 无监督语言对 上qe效果，有没有倒U型曲线的关系？
- 为什么system level结果这么差

还可以阅读的参考文献资料
- 【acl2019】YiSi - a Unified Semantic MT Quality Evaluation and Estimation Metric for Languages with Different Levels of Available Resources
- 【acl2019】Quality Estimation and Translation Metrics via Pre-trained Word and Sentence Embeddings
- 【acl2019】Results of the WMT19 metrics shared task: Segment-level and strong MT systems pose big challenges（可能是分析论文）