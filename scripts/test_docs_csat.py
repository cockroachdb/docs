#!/usr/bin/env python

import unittest
import docs_csat as dc


class TestDocsCSAT(unittest.TestCase):

    def test_calculate_csat(self):
        no_votes = {"page1": 1, "page2": 0, "page3": 1, "page4": 10}
        yes_votes = {"page2": 10, "page3": 10, "page5": 1, "page6": 0}
        pageviews = {"page2": 1000, "page4": 10}
        # Raises ZeroDivisionError from wegihted CSAT section, line
        # `average_csats[k] = yes / total`
        self.assertRaises(ZeroDivisionError, dc.calculate_csat, no_votes,
                          yes_votes, pageviews)

        no_votes = {"page1": 1, "page2": 0, "page3": 1, "page4": 10}  # 12
        yes_votes = {"page2": 10, "page3": 10, "page5": 1, "page6": 1}  # 22
        pageviews = {"page2": 1000, "page4": 10}  # 1000 yes, 10 no
        basic_csat, weighted_csat = dc.calculate_csat(no_votes, yes_votes,
                                                      pageviews)
        self.assertEqual(basic_csat, 22 / (12 + 22))
        self.assertEqual(weighted_csat, 1000 / (1000 + 10))


if __name__ == '__main__':
    unittest.main()
