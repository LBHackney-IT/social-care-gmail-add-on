function onGmailMessageOpen(e) {
  const accessToken = e.gmail.accessToken
  GmailApp.setCurrentMessageAccessToken(accessToken)

  const messageId = e.gmail.messageId;
  const message = GmailApp.getMessageById(messageId)
  const thread = message.getThread()
  const messageCount = thread.getMessageCount()

  const sendCard = CardService.newCardBuilder()
      .setHeader(CardService
        .newCardHeader()
        .setTitle('Save as a case note')
        .setSubtitle("Some formatting may not be preserved.")
      )

      .addSection(
        CardService.newCardSection()  
          .addWidget(CardService.newSelectionInput()
            .setFieldName("type")
            .setTitle("What do you want to save?")
            .setType(CardService.SelectionInputType.RADIO_BUTTON)
            .addItem(`Whole thread of ${messageCount} email${messageCount > 1 ? "s" : ""}`, "all", true)
            .addItem("Just this email", "one", false))

          .addWidget(CardService
            .newTextInput()
            .setFieldName("social_care_id")
            .setTitle("Social care ID")
            .setHint("Eg. 12345678"))

          .addWidget(CardService.newTextInput()
            .setFieldName("summary")
            .setTitle("Summary")
            .setMultiline(true)
            .setHint("Eg. 'New job'. No more than 500 characters.")) 
      )

      .setFixedFooter(CardService.newFixedFooter()
        .setPrimaryButton(CardService.newTextButton()
          .setText("Finish and send")
          .setOnClickAction(CardService.newAction()
            .setFunctionName('send'))))

      .build()

  return [sendCard]
}
