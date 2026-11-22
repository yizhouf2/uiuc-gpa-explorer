library(tidyverse)
url="https://raw.githubusercontent.com/wadefagen/datasets/refs/heads/main/gpa/uiuc-gpa-dataset.csv"
gpa=read_csv(url)
grade_order=c("A+",
              "A",
              "A-",
              "B+",
              "B",
              "B-",
              "C+",
              "C",
              "C-",
              "D+",
              "D",
              "D-",
              "F",
              "W")
gpa=gpa |>
  select(-YearTerm)|>
  select(Year:`Sched Type`,`Primary Instructor`,everything())|>
  rename(Title=`Course Title`,Type=`Sched Type`, Instructor=`Primary Instructor`)
write_csv(x=gpa,file="data/gpa.csv")

gpa|>
  filter(Subject=="STAT",Number==410)|>
  filter(Instructor=="Stepanov, Alexey G")|>
  pivot_longer(`A+`:W,names_to="Letter",values_to = "Count")|>
  group_by(Letter)|>
  summarise(Count=sum(Count))|>
  mutate(Letter=factor(Letter,levels=grade_order))|>
  ggplot()+
  aes(x=Letter,y=Count,fill=Letter)|>
  geom_bar(stat="identity")+
  theme_bw()
