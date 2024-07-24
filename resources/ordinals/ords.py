import pandas as pd
ords = """Ordinal_366
Ordinal_384
Ordinal_414
Ordinal_470
Ordinal_501
Ordinal_520
Ordinal_532
Ordinal_535
Ordinal_536
Ordinal_537
Ordinal_540
Ordinal_541
Ordinal_542
Ordinal_559
Ordinal_560
Ordinal_561
Ordinal_567
Ordinal_602
Ordinal_603
Ordinal_613
Ordinal_617
Ordinal_640
Ordinal_641
Ordinal_652
Ordinal_665
Ordinal_668
Ordinal_674
Ordinal_713
Ordinal_755
Ordinal_773
Ordinal_781
Ordinal_800
Ordinal_801
Ordinal_802
Ordinal_812
Ordinal_813
Ordinal_815
Ordinal_818
Ordinal_823
Ordinal_825
Ordinal_858
Ordinal_860
Ordinal_879
Ordinal_882
Ordinal_922
Ordinal_924
Ordinal_926
Ordinal_939
Ordinal_940
Ordinal_941
Ordinal_975
Ordinal_986
Ordinal_1083
Ordinal_1089
Ordinal_1134
Ordinal_1140
Ordinal_1146
Ordinal_1153
Ordinal_1168
Ordinal_1200
Ordinal_1232
Ordinal_1576
Ordinal_1640
Ordinal_1641
Ordinal_1665
Ordinal_1726
Ordinal_1727
Ordinal_1746
Ordinal_1775
Ordinal_1776
Ordinal_1825
Ordinal_1842
Ordinal_1871
Ordinal_1945
Ordinal_1949
Ordinal_1969
Ordinal_1979
Ordinal_1980
Ordinal_2004
Ordinal_2055
Ordinal_2086
Ordinal_2096
Ordinal_2124
Ordinal_2135
Ordinal_2302
Ordinal_2379
Ordinal_2385
Ordinal_2390
Ordinal_2393
Ordinal_2396
Ordinal_2399
Ordinal_2408
Ordinal_2414
Ordinal_2446
Ordinal_2510
Ordinal_2512
Ordinal_2514
Ordinal_2542
Ordinal_2554
Ordinal_2614
Ordinal_2621
Ordinal_2648
Ordinal_2649
Ordinal_2688
Ordinal_2723
Ordinal_2725
Ordinal_2740
Ordinal_2770
Ordinal_2781
Ordinal_2784
Ordinal_2801
Ordinal_2818
Ordinal_2820
Ordinal_2859
Ordinal_2864
Ordinal_2878
Ordinal_2879
Ordinal_2915
Ordinal_2919
Ordinal_2971
Ordinal_2976
Ordinal_2982
Ordinal_2985
Ordinal_3058
Ordinal_3059
Ordinal_3065
Ordinal_3079
Ordinal_3081
Ordinal_3089
Ordinal_3092
Ordinal_3136
Ordinal_3147
Ordinal_3172
Ordinal_3178
Ordinal_3181
Ordinal_3198
Ordinal_3259
Ordinal_3262
Ordinal_3346
Ordinal_3350
Ordinal_3402
Ordinal_3403
Ordinal_3454
Ordinal_3495
Ordinal_3517
Ordinal_3528
Ordinal_3567
Ordinal_3571
Ordinal_3573
Ordinal_3596
Ordinal_3597
Ordinal_3619
Ordinal_3626
Ordinal_3663
Ordinal_3702
Ordinal_3708
Ordinal_3738
Ordinal_3748
Ordinal_3749
Ordinal_3790
Ordinal_3798
Ordinal_3811
Ordinal_3825
Ordinal_3830
Ordinal_3831
Ordinal_3874
Ordinal_3922
Ordinal_4034
Ordinal_4058
Ordinal_4077
Ordinal_4078
Ordinal_4079
Ordinal_4080
Ordinal_4108
Ordinal_4129
Ordinal_4132
Ordinal_4151
Ordinal_4159
Ordinal_4160
Ordinal_4202
Ordinal_4224
Ordinal_4234
Ordinal_4238
Ordinal_4242
Ordinal_4273
Ordinal_4274
Ordinal_4278
Ordinal_4299
Ordinal_4303
Ordinal_4330
Ordinal_4341
Ordinal_4349
Ordinal_4353
Ordinal_4370
Ordinal_4376
Ordinal_4387
Ordinal_4407
Ordinal_4420
Ordinal_4424
Ordinal_4425
Ordinal_4426
Ordinal_4427
Ordinal_4432
Ordinal_4436
Ordinal_4441
Ordinal_4448
Ordinal_4465
Ordinal_4467
Ordinal_4486
Ordinal_4524
Ordinal_4526
Ordinal_4529
Ordinal_4531
Ordinal_4543
Ordinal_4545
Ordinal_4588
Ordinal_4589
Ordinal_4622
Ordinal_4623
Ordinal_4627
Ordinal_4696
Ordinal_4698
Ordinal_4710
Ordinal_4723
Ordinal_4823
Ordinal_4837
Ordinal_4853
Ordinal_4858
Ordinal_4890
Ordinal_4892
Ordinal_4899
Ordinal_4953
Ordinal_4961
Ordinal_4964
Ordinal_4998
Ordinal_5012
Ordinal_5065
Ordinal_5076
Ordinal_5100
Ordinal_5103
Ordinal_5163
Ordinal_5199
Ordinal_5214
Ordinal_5237
Ordinal_5240
Ordinal_5241
Ordinal_5243
Ordinal_5252
Ordinal_5260
Ordinal_5261
Ordinal_5265
Ordinal_5277
Ordinal_5280
Ordinal_5282
Ordinal_5289
Ordinal_5290
Ordinal_5300
Ordinal_5301
Ordinal_5302
Ordinal_5307
Ordinal_5442
Ordinal_5472
Ordinal_5571
Ordinal_5577
Ordinal_5579
Ordinal_5583
Ordinal_5600
Ordinal_5601
Ordinal_5607
Ordinal_5653
Ordinal_5678
Ordinal_5714
Ordinal_5731
Ordinal_5736
Ordinal_5740
Ordinal_5756
Ordinal_5759
Ordinal_5768
Ordinal_5785
Ordinal_5787
Ordinal_5789
Ordinal_5794
Ordinal_5864
Ordinal_5873
Ordinal_5875
Ordinal_5937
Ordinal_5943
Ordinal_5981
Ordinal_6021
Ordinal_6052
Ordinal_6055
Ordinal_6061
Ordinal_6070
Ordinal_6080
Ordinal_6094
Ordinal_6117
Ordinal_6141
Ordinal_6143
Ordinal_6144
Ordinal_6157
Ordinal_6172
Ordinal_6175
Ordinal_6186
Ordinal_6189
Ordinal_6192
Ordinal_6197
Ordinal_6199
Ordinal_6215
Ordinal_6336
Ordinal_6374
Ordinal_6375
Ordinal_6376
Ordinal_6379
Ordinal_6380
Ordinal_6385
Ordinal_6438
Ordinal_6453
Ordinal_6567
Ordinal_6569
Ordinal_6571
Ordinal_6605
Ordinal_6880
Ordinal_6883
Ordinal_6927
Ordinal_6929"""

my_ar = []
for i in ords.split('\n'):
    k = i.replace('Ordinal_',"")
    print(f'{k}')
    my_ar.append(str(k))
pd.DataFrame(my_ar, columns=['Ordinal']).to_csv('ords.csv',index=False)

# # Parse MFC42.DEF file
# ordinal_to_function = {}
# with open('MFC42.DEF', 'r') as f:
#     for i, line in enumerate(f, start=1):
#         ordinal_to_function[str(i)] = line.strip()

# # Assuming ordinal_to_function is your dictionary
# df = pd.DataFrame(list(ordinal_to_function.items()), columns=['Ordinal', 'Function'])

# df.to_csv('ords2.csv', index=False)

import pandas as pd

# Read ords2.csv file
df = pd.read_csv('ords2.csv')

# Convert the 'Ordinal' column to string type
df['Ordinal'] = df['Ordinal'].astype(str)

# Check if the 'Ordinal' is in the 'Function' column
df['Ordinal_in_Function'] = df.apply(lambda row: row['Ordinal'] in row['Function'], axis=1)

# Write DataFrame back to ords2.csv file
df.to_csv('ords2.csv', index=False)

# # Read ords.csv file
# df = pd.read_csv('ords.csv')

# # Map ordinals to function names
# df['Function'] = df['Ordinal'].map(ordinal_to_function)

# # Write DataFrame back to ords.csv file
# df.to_csv('ords.csv', index=False)
