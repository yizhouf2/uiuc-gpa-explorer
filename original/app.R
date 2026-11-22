#load packages
library(shiny)
library(tidyverse)

#load data
gpa=read_csv(file="data/gpa.csv")
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
# Define UI for application that draws a histogram
ui <- navbarPage(
  title="GPA",
  tabPanel(
    title="Input/Visualization",
    titlePanel(title="UIUC GPA Data: 2010-2021"),
    sidebarLayout(
      sidebarPanel(
      selectInput(
        inputId="subj",
        label="Subject:",
        choices=sort(unique(gpa$Subject)),
        selected="STAT"),
      selectInput(
        inputId="numb",
        label="Number:",
        choices=sort(unique(gpa$Number))),
      selectInput(
        inputId="inst",
        label="Instructor:",
        choices=sort(unique(gpa$Instructor))),
      checkboxInput(inputId = "course",
                    label="Filter Table to Course Number",
                     value = F)
      ),
    mainPanel(plotOutput("distPlot"))
    )
  ),
  tabPanel(title="Table",dataTableOutput("table")),
  tabPanel(title="About",includeMarkdown("about.Rmd"))
)

# Define server logic required to draw a histogram
server <- function(input, output) {
    gpa_subj=reactive({
      gpa|>
        filter(Subject==input$subj)
    })
    observeEvent(
      eventExpr=input$subj,
      handlerExpr={
        updateSelectInput(inputId="numb",
                          choices=sort(unique(gpa_subj()$Number)),
                          selected=min((unique(gpa_subj()$Number))
                          ))
        updateSelectInput(inputId="inst",
                          choices=sort(unique(gpa_subj_numb()$Instructor)),
                          selected=sort((unique(gpa_subj_numb()$Instructor))[1]
                          ))
    })
    gpa_subj_numb=reactive({
      gpa_subj()|>
        filter(Number==input$numb)
    })
    observeEvent(
      eventExpr=input$numb,
      handlerExpr={
        updateSelectInput(
          inputId="inst",
          choices=sort(unique(gpa_subj_numb()$Instructor)),
          selected=sort((unique(gpa_subj_numb()$Instructor)[1])
          )
        )
      })
    output$distPlot <- renderPlot({
      gpa|>
        filter(Subject==input$subj,
               Number==input$numb)|>
        filter(Instructor==input$inst)|>
        pivot_longer(`A+`:W,names_to="Letter",values_to = "Count")|>
        group_by(Letter)|>
        summarise(Count=sum(Count))|>
        mutate(Letter=factor(Letter,levels=grade_order))|>
        ggplot()+
        aes(x=Letter,y=Count,fill=Letter)|>
        geom_bar(stat="identity")+
        theme_bw()
    })
    
    output$table=renderDataTable({
      tab=gpa_subj()|>
        calc_gpa()
      
      if(input$course){
        tab=tab|>
          filter(Number==input$numb)
      }
      tab
    })
}

# Run the application 
shinyApp(ui = ui, server = server)
