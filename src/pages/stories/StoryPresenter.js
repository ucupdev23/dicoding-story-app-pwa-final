export class StoryPresenter {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.stories = [];
  }

  async getStories() {
    this.view.showLoading();
    try {
      this.stories = await this.model.getStories();
      this.view.renderStories(this.stories);
    } catch (error) {
      console.error("Presenter: Error in getStories", error);
      this.view.renderFailedMessage();
    }
  }

  getCurrentStories() {
    return this.stories;
  }
}
