"""
Tests for the person indexer
"""
from unittest import mock

from django.test import TestCase

from cms.api import add_plugin
from djangocms_picture.models import Picture

from richie.apps.courses.factories import PersonFactory
from richie.apps.search.indexers.persons import PersonsIndexer


class PersonsIndexersTestCase(TestCase):
    """
    Test the get_es_documents() function on the person indexer, as well as our mapping,
    and especially dynamic mapping shape in ES
    """

    @mock.patch.object(
        Picture, "img_src", new_callable=mock.PropertyMock, return_value="123.jpg"
    )
    def test_indexers_persons_get_es_documents(self, _mock_picture):
        """
        Happy path: person data is fetched from the models properly formatted
        """
        person1 = PersonFactory(
            fill_portrait=True,
            page_title={"en": "my first person", "fr": "ma première personne"},
            should_publish=True,
        )
        person2 = PersonFactory(
            page_title={"en": "my second person", "fr": "ma deuxième personne"},
            should_publish=True,
        )

        # Add a description in several languages to the first person
        placeholder = person1.public_extension.extended_object.placeholders.get(
            slot="bio"
        )
        plugin_params = {"placeholder": placeholder, "plugin_type": "CKEditorPlugin"}
        add_plugin(body="english bio line 1.", language="en", **plugin_params)
        add_plugin(body="english bio line 2.", language="en", **plugin_params)
        add_plugin(body="texte français ligne 1.", language="fr", **plugin_params)
        add_plugin(body="texte français ligne 2.", language="fr", **plugin_params)

        # The results were properly formatted and passed to the consumer
        self.assertEqual(
            sorted(
                list(
                    PersonsIndexer.get_es_documents(
                        index="some_index", action="some_action"
                    )
                ),
                key=lambda p: p["_id"],
            ),
            [
                {
                    "_id": str(person1.public_extension.extended_object.id),
                    "_index": "some_index",
                    "_op_type": "some_action",
                    "_type": "person",
                    "absolute_url": {
                        "en": "/en/my-first-person/",
                        "fr": "/fr/ma-premiere-personne/",
                    },
                    "bio": {
                        "en": "english bio line 1. english bio line 2.",
                        "fr": "texte français ligne 1. texte français ligne 2.",
                    },
                    "complete": {
                        "en": ["my first person", "first person", "person"],
                        "fr": ["ma première personne", "première personne", "personne"],
                    },
                    "portrait": {"en": "123.jpg", "fr": "123.jpg"},
                    "title": {"en": "my first person", "fr": "ma première personne"},
                },
                {
                    "_id": str(person2.public_extension.extended_object.id),
                    "_index": "some_index",
                    "_op_type": "some_action",
                    "_type": "person",
                    "absolute_url": {
                        "en": "/en/my-second-person/",
                        "fr": "/fr/ma-deuxieme-personne/",
                    },
                    "bio": {},
                    "complete": {
                        "en": ["my second person", "second person", "person"],
                        "fr": ["ma deuxième personne", "deuxième personne", "personne"],
                    },
                    "portrait": {},
                    "title": {"en": "my second person", "fr": "ma deuxième personne"},
                },
            ],
        )

    def test_indexers_persons_format_es_object_for_api(self):
        """
        Make sure format_es_object_for_api returns a properly formatted person
        """
        es_person = {
            "_id": 217,
            "_source": {
                "portrait": {"en": "/my_portrait.png", "fr": "/mon_portrait.png"},
                "title": {
                    "en": "University of Paris XIII",
                    "fr": "Université Paris 13",
                },
            },
        }
        self.assertEqual(
            PersonsIndexer.format_es_object_for_api(es_person, "en"),
            {
                "id": 217,
                "portrait": "/my_portrait.png",
                "title": "University of Paris XIII",
            },
        )